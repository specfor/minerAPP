<script>
    function passwordStrengthCheck() {
        //Getting password input
        const pwi = document.getElementById('password')
        console.log("Im working")

        //Strong password
        const strongRegex = new RegExp("^(?=.{14,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");

        //Medium strong password
        const mediumRegex = new RegExp("^(?=.{10,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");

        //Just enough password
        const enoughRegex = new RegExp("(?=.{8,}).*", "g");

        //Accessing paragraph
        let invPwP = document.getElementById('notValidPass')

        //Checking whether password field is empty
        if (false == enoughRegex.test(pwi.value)) {
            invPwP.innerText = "Enter more characters."
            console.log('valid 1')
        } else if (strongRegex.test(pwi.value)) {
            invPwP.innerText = "Your password is Strong."
            console.log('valid 2')
        } else if (mediumRegex.test(pwi.value)) {
            invPwP.innerText = "Your password is Medium Strong."
            console.log('valid 3')
        } else {
            invPwP.innerText = "Your password is Weak ."
            console.log('valid 4')
        }
    }

    function checkEmailValidity() {
        const emailInput = document.getElementById('emailad')
        let validPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        if (emailInput.value.match(validPattern)) {
            let invalid = document.getElementById("notValidEmail")
            invalid.innerText = "Success"
        } else {
            let invalid = document.getElementById("notValidEmail")
            invalid.innerText = "Email you entered is not valid!"
        }
    }

    function confirmPass() {
        const Cpass = document.getElementById('ConfirmPassword')
        const Fpass = document.getElementById('password')
        if (Cpass.value == Fpass.value) {
            let updatepara = document.getElementById('confirmPw')
            updatepara.innerText = ""

        } else {
            let updatepara = document.getElementById('confirmPw')
            updatepara.innerText = "Passwords you entered don't match."

        }
    }
</script>

<style>
    body {
        background-image: url("images/background.jpg");
        height: 100vh;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
    }
</style>
<div class="container-sm bg-white text-center h-auto " style="height: 550px;
    width:300px;
    margin:auto;
    border-radius: 1.2rem;
     margin-top: 60px;">

    <form action="/register" method="post">
        <img class="mt-3" src="/images/logo.png" alt="Logo" style="height: 50px;width: 50px;">
        <h1 class="h3 mt-3">Sign Up</h1>
        <div class="row">
            <div class="col-sm-6">
                <input name="firstname" type="text" class="form-control mt-4" id="firstname" placeholder="First Name" autofocus required>
            </div>
            <div class="col-sm-6">
                <input name="lastname" type="text" class="form-control mt-4" id="lastname" placeholder="Last Name" autofocus required>
            </div>
        </div>
        <input name="username" type="text" class="form-control mt-4" id="username" placeholder="Username" autofocus required>
        <input name="email" type="email" class="form-control mt-4" id="emailad" placeholder="Email Address" autofocus required
               onkeyup="">
        <p class="text-danger" id="notValidEmail" style="font-size: .8rem;"></p>
        <input name="password" type="password" class="form-control mt-4" id="password" maxlength="24" minlength="8"
               placeholder="Password"
               autofocus required onkeyup="passwordStrengthCheck()">
        <p class="text-danger" id="notValidPass" style="font-size: .8rem;"></p>
        <input name="confirmPassword" type="password" class="form-control mt-4" id="ConfirmPassword" placeholder="Confirm Password" autofocus
               required onkeyup="confirmPass()">
        <p class="text-danger" id="confirmPw" style="font-size: .8rem;"></p>
        <input type="hidden" name="csrf-token" value="{{register:csrf-token}}">
        <div class="mt-4">
            <button class="btn btn-primary  " onclick="checkEmailValidity()">Create Account</button>
        </div>
        <div class="mt-3">
            <p style="font-size:.8rem;">Have an account?<a href="login">Log In</a></p>
        </div>
    </form>
</div>
