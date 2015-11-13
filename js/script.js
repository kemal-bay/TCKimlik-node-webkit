var TCKimlik = {
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
			DogumYili: parseInt($("select[name=yearOfBirth]").val()),
		},errors = [];

		if(args.Ad.length < 3){ errors.push("Ad geçersiz gözüküyor"); }
		if(args.Soyad.length < 2){ errors.push("Soyad geçersiz gözüküyor"); }
		if(isNaN(args.DogumYili) || args.DogumYili < 1900 || args.DogumYili > new Date().getFullYear()){ 
			errors.push("Doğum yılı geçersiz gözüküyor");
		}

		if(errors.length > 0){
			TCKimlik.showResult(false, errors.join("<br>"));
		}else{
			TCKimlik.processForm(args,TCKimlik.showResult);
		}
	},
	resetForm: function(e){
		e.preventDefault();
		$("form").clearForm();
		$("select").select2("val", "");
		$('.alert').remove();
	},
	processForm: function(args, callback){
		if(false === TCKimlik.checkTCKimlikNo(args.TCKimlikNo)){
			TCKimlik.showResult(false, 'TC Kimlik No geçersiz');
		}else{
			TCKimlik.lib.soap.createClient(TCKimlik.config.url, function(err, client) {
				client.TCKimlikNoDogrula(args, function(err, result) {
					callback(result.TCKimlikNoDogrulaResult, result.TCKimlikNoDogrulaResult ? 'TC Kimlik No doğrulandı' : 'TC Kimlik No doğrulanamadı');
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
	showResult: function(result, text){
		$('.alert').alert('close');
		$('h3').after('<div role="alert" class="alert alert-' + (result ? 'success' : 'danger') + ' alert-dismissible fade in"><button aria-label="Close" data-dismiss="alert" class="close" type="button"><span aria-hidden="true">×</span></button><h4>' + (result ? 'Başarılı!' : 'HATA!') + '</h4><p>' + text + '</p></div>');
	},
	init: function(){
		var i, years = [];
		for(var i = (new Date()).getFullYear() - 18; i >= 1900; i--) {
			years.push(i);
		}
		$('select').select2({ data: years, placeholder: "Doğum yılı", allowClear: true });
		$(document).on("click", "#submit",TCKimlik.validateForm);
		$(document).on("click", "#reset",TCKimlik.resetForm);
	}
}

TCKimlik.init();