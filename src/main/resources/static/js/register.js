const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const password = document.getElementById("password").value;

    registerMessage.textContent = "";
    registerMessage.className = "form-message";

    const caregiver = {
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
        password: password
    };

    try {

        const response = await fetch("/api/v1/caregiver/add-caregiver", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(caregiver)
        });

        // نستقبل الرد كنص أولاً
        const responseText = await response.text();

        let message = responseText;

        // إذا كان الرد JSON نطلع message منه
        try {
            const data = JSON.parse(responseText);

            if (data.message) {
                message = data.message;
            }
        } catch (error) {
            // الرد String عادي، نخليه مثل ما رجع من Backend
        }


        if (!response.ok) {

            registerMessage.textContent = message;
            registerMessage.className = "form-message error";

            return;
        }


        registerMessage.textContent = message || "تم إنشاء الحساب بنجاح";
        registerMessage.className = "form-message success";


        setTimeout(function () {
            window.location.href = "/login";
        }, 1000);


    } catch (error) {

        registerMessage.textContent =
            "حدث خطأ في الاتصال، حاول مرة أخرى";

        registerMessage.className = "form-message error";

        console.error(error);
    }

});