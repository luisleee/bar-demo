(function () {
    var tabLogin = document.getElementById("tab-login");
    var tabRegister = document.getElementById("tab-register");
    var login = document.getElementById("login");
    var register = document.getElementById("register");
    tabLogin.addEventListener(
        "click",
        () => {
            tabLogin.classList.add("tab-active");
            tabLogin.classList.remove("tab-hide");
            login.classList.add("active");
            login.classList.remove("hide");
            tabRegister.classList.remove("tab-active");
            tabRegister.classList.add("tab-hide");
            register.classList.remove("active");
            register.classList.add("hide");
        },
        false
    );

    tabRegister.addEventListener(
        "click",
        () => {
            tabRegister.classList.add("tab-active");
            tabRegister.classList.remove("tab-hide");
            register.classList.add("active");
            register.classList.remove("hide");

            tabLogin.classList.remove("tab-active");
            tabLogin.classList.add("tab-hide");
            login.classList.remove("active");
            login.classList.add("hide");
        },
        false
    );
})();
