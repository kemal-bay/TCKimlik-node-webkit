TCKimlik = {
	config: {
		url: 'https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx?wsdl'
	},
	lib: {
		os: require('os'),
		gui: require('nw.gui'),
		soap: require("soap")
	},
	validateForm: function(e){
		e.preventDefault();
		$("#result").removeClass("text-success").removeClass("text-danger").text("İsteğiniz işleniyor...");
		var args = {
			TCKimlikNo: parseInt($("input[name=identity]").val()),
			Ad: $("input[name=firstName]").val().replace("i","İ").replace("ı","I").toUpperCase(),
			Soyad: $("input[name=lastName]").val().replace("i","İ").replace("ı","I").toUpperCase(),
			DogumYili: parseInt($("input[name=yearOfBirth]").val()),
		},errors = [];

		if(args.Ad.length < 3){ errors.push("Ad geçersiz gözüküyor"); }
		if(args.Soyad.length < 2){ errors.push("Soyad geçersiz gözüküyor"); }
		if(isNaN(args.DogumYili) || args.DogumYili < 1900 || args.DogumYili > new Date().getFullYear()){ 
			errors.push("Doğum yılı geçersiz gözüküyor");
		}

		if(errors.length > 0){
			$("#result").html(errors.join("<br>")).addClass("text-danger");
		}else{
			TCKimlik.processForm(args,TCKimlik.showResult);
		}
	},
	resetForm: function(e){
		e.preventDefault();
		$("input[name=identity]").val("");
		$("input[name=firstName]").val("");
		$("input[name=lastName]").val("");
		$("input[name=yearOfBirth]").val("");
		$("#result").removeClass("text-success").removeClass("text-danger").text("");
	},
	processForm: function(args, callback){
		if(false === TCKimlik.checkTCKimlikNo(args.TCKimlikNo)){
			TCKimlik.showResult(false);
		}else{
			TCKimlik.lib.soap.createClient(TCKimlik.config.url, function(err, client) {
				client.TCKimlikNoDogrula(args, function(err, result) {
					callback(result.TCKimlikNoDogrulaResult);
				});
			});
		}
	},
	checkTCKimlikNo: function(tckn) {
	    var exceptions = ['11111111110', '22222222220', '33333333330', '44444444440', '55555555550', '66666666660', '77777777770', '88888888880', '99999999990'],
	        t1 = 0,
	        t2 = 0,
	        c10, c11, i;
	    tckn = tckn.toString().trimLeft('0');
	    if (false === (!isNaN(parseFloat(tckn)) && isFinite(tckn)) || tckn.length != 11 || $.inArray(tckn, exceptions) > -1) {
	        return false;
	    } else {
	        for (i = 0; i < 9; i = i + 2) {
	            t1 += parseInt(tckn.charAt(i), 10);
	        }
	        for (i = 1; i < 8; i = i + 2) {
	            t2 += parseInt(tckn.charAt(i), 10);
	        }
	        c10 = (10 - (((t1 * 3) + t2) % 10)) % 10;
	        c11 = (10 - ((((t2 + c10) * 3) + t1) % 10)) % 10;
	        return tckn.substring(9, 11) == [c10, c11].join('');
	    }
	},
	showResult: function(result){
		if(result){
			$("#result").text("Kimlik numarası doğrulandı").addClass("text-success");
		}else{
			$("#result").text("Kimlik numarası doğrulanamadı").addClass("text-danger");
		}
	},
	init: function(){
		$(document).on("click", "#submit",TCKimlik.validateForm);
		$(document).on("click", "#reset",TCKimlik.resetForm);
	}
}

TCKimlik.init();