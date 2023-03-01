function checkEmailValidity() {
    const emailInput = document.getElementById('emailAdd')
    let validPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    passwordStrengthCheck()
    if (emailInput.value.match(validPattern)) {
    } else {
      let invalid = document.getElementById("notValidEmail")
      invalid.innerText = "Email you entered is not valid!"
    }
  }
  
  function passwordStrengthCheck() {
    //Getting password input
    const pwi = document.getElementById('passW')
  
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