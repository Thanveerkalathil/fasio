$("#signup-form").validate({
  errorClass: "jqueryValidationError",
  rules: {
    username: {
      required: true,
      minlength: 4,
      maxlength:25
    },
    email:{
        required:true,
        minlength:13
    },
    phoneNumber:{
        required:true,
        maxlength:10,
        minlength:10,

    },
    password : {
        required : true,
        minlength:5
    },
    confirmPassword : {
        equalTo : '#password',
        required:true,
        minlength:5
    }
  },
  messages: {
    username : {
        required : "Enter username",
        minlength : "Enter minimum 4 characters"
    },
    phoneNumber:{
        required:"Enter Phone Number",
        minlength:"Enter atleast 10 Numbers",
        maxlength:"Only 10 Numbers are require"
    }
  },
  errorPlacement: (error, element) => {
    if (element.parent().hasClass("input-group")) {
      error.insertAfter(element.parent());
    } else {
      error.insertAfter(element);
    }
  },
});
