<style>
    body {
        background-image: url("images/background.jpg");
        height: 100%;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
    }
</style>

<div class="container-sm bg-white text-center " style="height: 400px;
    width:300px;
    margin:auto;
    border-radius: 1.2rem;
     margin-top: 110px;">
    <form action="/login" method="post">
        <img class="mt-3" src="images/logo.png" alt="Logo" style="height: 50px;width: 50px;">
        <h1 class="h3 mt-3">Log In</h1>
        <input name="email" type="email" class="form-control mt-4" id="emailAdd" placeholder="Email Address" autofocus required>
        <p class="text-danger" id="notValidEmail" style="font-size: .8rem;"></p>
        <input name="password" type="password" class="form-control mt-4" id="passW" placeholder="Password" autofocus required
               minlength="8" maxlength="24" onkeyup="passwordStrengthCheck()">
        <p class="text-danger" id="notValidPass" style="font-size: .8rem;"></p>
        <div class="checkbox mt-2" style="font-size:.8rem;font-weight: bold;">
            <label><input type="checkbox" value="remember-me"> Remember me</label>
        </div>
        <div class="mt-3">
            <button class="btn btn-primary " onclick="checkEmailValidity()"> Log In</button>
        </div>
        <div class="mt-3">
            <p style="font-size:.8rem;">Don't have an account?<a href="signin.html">Sign In</a></p>
        </div>
    </form>
</div>

