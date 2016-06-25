var Bot = require('messenger-bot');
var ACCESS_TOKEN = 'EAAYkkZA9wDgwBAHLyHHwhXIcNlgu4fsUsVkAkIKSZChu7pdMRoLHAPnqOgiSp3KTnR4ZAc3dtEZBKqFj4jM3eot03V1BeswKulgO3RlZB8igvEG205ZApxtZAcoWZBT7fiK9aQCZBV6dso6JAMnE0tKWSTGEBR6MpVxbSZBxZB9ehl84wZDZD';
var http = require('http');
var fs = require('fs');
var keyword_extractor = require("keyword-extractor");
var argmax = require('compute-argmax');
var jsonfile = require('jsonfile')
var bot = new Bot({
  token: ACCESS_TOKEN,
  verify: 'raph_token'
});
var data = jsonfile.readFileSync('Data/Prod_prix.json');
var list_prod = data[0];
var list_prix = data[1];

bot.on('error', function(err){
  console.log(err.message)
});

bot.on('message', function(payload, reply){
  var text = payload.message.text

    bot.sendMessage(payload.sender.id, {text: get_response(text)}, function(err, info){
    if(err){
      console.log(err);
    }
  });
});


http.createServer(bot.middleware()).listen(3000, function(){
  console.log('App is listening');
});


var get_response = function(message){
  var default_response = "Desole je n'ai pas compris votre demande.";
  var keywords = keyword_extractor.extract(message, {language:"french"});
  var result_product = check_prices(keywords);
  if (result_product['product'] == 0){
    return("Je suis desole je ne connais pas ce produit.")
  }
  if(result_product['found']){
    return("Le prix du "+result_product["product"] + " est de " + result_product["price"] + " euros.");
  }
  else{
    return("De quel "+ result_product["product"] + " parlez vous? \n" + result_product["products"]);
  }
}
var check_prices = function(keywords){
  var scores = []
  var commons = []
    for (i=0; i<list_prod.length; i++){
      common = list_prod[i].filter(function(n) {
        return keywords.indexOf(n) != -1 && n.length > 2; // Avoid sizes
      });
      commons.push(common);
      scores.push(common.length);
  }
  args_val = argmax(scores);
  max_elem = args_val[0];
  if(args_val.length == 1){
    return {'product': list_prod[max_elem].join(" "), 'price': list_prix[max_elem], 'found': true};
  }
  // TODO Make it smarted see below (check if common are all equals)
  else if(scores[max_elem] > 0){
    list_comm = []
    for (var i=0; i<args_val.length; i++){
      list_comm.push(list_prod[args_val[i]].join(" "));
    }
    return {'product': commons[max_elem].join(" "), 'price': 0, 'found': false, 'products': list_comm.join("\n")};
  }
  else{
    return {'product': 0, 'price': 0, 'found': false};
  }
}
//console.log(get_response('Hello quel est prix du sac candide'));

    // commons.forEach(function(elem, ind){
    //   if(args_val.indexOf(ind) > -1){
    //     if(val_com != elem);
    //     if(!all_eq)
    //       break;
    //   }
    // });








  // bot.getProfile(payload.sender.id, function(err, profile){
  //   if(err){
  //   console.log(err);
  //   }

      // var response_message = 'Hey ' + profile.first_name;
      // if(text == 'fettay'){
      //   response_message = 'You just entered the magic code: FUCK YOU';
      // }