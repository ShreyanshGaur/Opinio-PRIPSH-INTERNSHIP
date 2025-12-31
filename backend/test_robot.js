const axios = require('axios');
const colors = require('colors');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';
let activeSurveyId = '';
let expiredSurveyId = '';

// Helper to log steps
const logStep = (msg) => console.log(`\n🔹 ${msg}`.cyan.bold);
const logPass = (msg) => console.log(`   ✅ PASS: ${msg}`.green);
const logFail = (msg, err) => {
    console.log(`   ❌ FAIL: ${msg}`.red);
    if(err.response) {
        console.log(`      Status: ${err.response.status} - ${JSON.stringify(err.response.data)}`.yellow);
    } else {
        console.log(`      Error: ${err.message}`.yellow);
    }
    process.exit(1); // Stop tests on failure
};

const runTests = async () => {
    console.log(`\n🚀 STARTING AUTOMATED SYSTEM CHECK...`.bgBlue.white.bold);

    // 1. TEST REGISTRATION
    logStep("Testing User Registration...");
    const testUser = {
        name: "Test Robot",
        email: `robot_${Date.now()}@example.com`, // Unique email every time
        password: "password123"
    };
    try {
        const res = await axios.post(`${API_URL}/auth/register`, testUser);
        if(res.data.token) {
            authToken = res.data.token;
            logPass("User Registered & Token Received");
        }
    } catch (err) { logFail("Registration Failed", err); }

    // 2. TEST LOGIN (Double Check)
    logStep("Testing User Login...");
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        if(res.data.token) {
            logPass("Login Successful");
        }
    } catch (err) { logFail("Login Failed", err); }

    const authHeaders = { headers: { 'x-auth-token': authToken } };

    // 3. CREATE NORMAL SURVEY
    logStep("Creating Active Survey...");
    try {
        const surveyData = {
            title: "Robot Active Survey",
            description: "Automated Test",
            questions: [{ questionText: "Is this working?", questionType: "text", required: true }]
        };
        const res = await axios.post(`${API_URL}/surveys`, surveyData, authHeaders);
        activeSurveyId = res.data._id;
        logPass(`Survey Created (ID: ${activeSurveyId})`);
    } catch (err) { logFail("Create Survey Failed", err); }

    // 4. CREATE EXPIRED SURVEY (To test security)
    logStep("Creating EXPIRED Survey (Security Test)...");
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1); // Set date to yesterday

        const surveyData = {
            title: "Robot Expired Survey",
            questions: [{ questionText: "Should not see this", required: false }],
            expiresAt: yesterday // <--- Setting past date
        };
        const res = await axios.post(`${API_URL}/surveys`, surveyData, authHeaders);
        expiredSurveyId = res.data._id;
        logPass(`Expired Survey Created (ID: ${expiredSurveyId})`);
    } catch (err) { logFail("Create Expired Survey Failed", err); }

    // 5. TEST PUBLIC ACCESS (Active)
    logStep("Accessing ACTIVE Survey (Public Link)...");
    try {
        const res = await axios.get(`${API_URL}/surveys/public/${activeSurveyId}`);
        if(res.status === 200) logPass("Active Survey is Accessible");
    } catch (err) { logFail("Active Survey Access Failed", err); }

    // 6. TEST PUBLIC ACCESS (Expired) - SHOULD FAIL
    logStep("Accessing EXPIRED Survey (Public Link)...");
    try {
        await axios.get(`${API_URL}/surveys/public/${expiredSurveyId}`);
        // If we reach here, it failed because it SHOULD have thrown an error
        logFail("Security Breach! Expired survey was accessible!"); 
    } catch (err) {
        if(err.response && err.response.status === 423) {
            logPass("Security Success! Expired survey returned 423 Locked.");
        } else {
            logFail("Unexpected Error on Expired Survey", err);
        }
    }

    // 7. CLEANUP (Delete Surveys)
    logStep("Cleaning Up Test Data...");
    try {
        await axios.delete(`${API_URL}/surveys/${activeSurveyId}`, authHeaders);
        await axios.delete(`${API_URL}/surveys/${expiredSurveyId}`, authHeaders);
        logPass("Test Surveys Deleted");
    } catch (err) { logFail("Cleanup Failed", err); }

    console.log(`\n🎉 ALL SYSTEMS OPERATIONAL. TEST SUITE PASSED.\n`.bgGreen.black.bold);
};

runTests();