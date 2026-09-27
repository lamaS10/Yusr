const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "";
    loginMessage.className = "form-message";

    try {

        const params = new URLSearchParams();
        params.append("email", email);
        params.append("password", password);

        const response = await fetch("/api/v1/caregiver/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params
        });

        const responseText = await response.text();

        let data = null;
        let message = responseText;

        try {
            data = JSON.parse(responseText);

            if (data.message) {
                message = data.message;
            }
        } catch (error) {
            // Backend returned plain String
        }

        if (!response.ok) {
            loginMessage.textContent = message;
            loginMessage.className = "form-message error";
            return;
        }

        sessionStorage.setItem("caregiverId", data.id);
        sessionStorage.setItem("caregiverName", data.fullName);
        sessionStorage.setItem("caregiverRole", data.role);

        if (data.patientId !== null) {
            sessionStorage.setItem("patientId", data.patientId);
        } else {
            sessionStorage.removeItem("patientId");
        }

        window.location.href = "/dashboard";

    } catch (error) {

        loginMessage.textContent =
            "حدث خطأ في الاتصال، حاول مرة أخرى";

        loginMessage.className = "form-message error";

        console.error(error);
    }

});