function dp(textToWrite) {
    if ('Blob' in window) {
        var fileName = "klamki-online.xml";
        var textFileAsBlob = new Blob([textToWrite], {
            type: 'text/xml'
        });

        var downloadLink = document.createElement("a");
        downloadLink.download = fileName;
        downloadLink.innerHTML = "Download File";
        if ('webkitURL' in window) {
            // Chrome allows the link to be clicked without actually adding it to the DOM.
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        } else {
            // Firefox requires the link to be added to the DOM before it can be clicked.
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }

        downloadLink.click();
    } else {
        alert('Your browser does not support the HTML5 Blob.');
    }
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const doSomething = async () => {
	var s = ' ';
	var product_iterator = 0;
	var kat_links = new Array();
	var kat_names = new Array();
	var pagination_links = new Array();
	var product_links = new Array();
	
	var xhr = new XMLHttpRequest();
	
	xhr.open("GET", 'https://klamki-online.pl/' );
	xhr.responseType = "document";
	xhr.send();
	await sleep(4000);
	
	for (let i = 0; i < xhr.responseXML.querySelectorAll('#box_menu li:not(#category_novelties):not(#category_promo) a').length; i++) {
		kat_links[i] = 'https://klamki-online.pl' + xhr.responseXML.querySelectorAll('#box_menu li:not(#category_novelties):not(#category_promo) a')[i].getAttribute('href');
		kat_names[i] = xhr.responseXML.querySelectorAll('#box_menu li:not(#category_novelties):not(#category_promo) a')[i].getAttribute('href').split('/')[document.querySelectorAll('#box_menu li:not(#category_novelties):not(#category_promo) a')[i].getAttribute('href').split('/').length-2];
	}
	
	for (var x = 0; x < kat_links.length; x++) {
		
		var xhr = new XMLHttpRequest();

		xhr.open("GET", kat_links[x] );
		xhr.responseType = "document";
		xhr.send();
		await sleep(4000);
		
		if ( xhr.responseXML.querySelectorAll('.innerbox .floatcenterwrap ul.paginator li').length !== 0 ) {
			
			var last_page = xhr.responseXML.querySelectorAll('.innerbox .floatcenterwrap ul.paginator li').length - 2;
			var last_page_link_length = xhr.responseXML.querySelectorAll('.innerbox .floatcenterwrap ul.paginator li')[last_page].children[0].getAttribute('href').split('/').length;
			var last_page_link = xhr.responseXML.querySelectorAll('.innerbox .floatcenterwrap ul.paginator li')[last_page].children[0].getAttribute('href').split('/')[last_page_link_length-1];
			var licznik = 1;
			pagination_links = [];
			pagination_links[0] = kat_links[x];
			
			for (let i = 2; i <= last_page_link; i++) {
				pagination_links[licznik] = kat_links[x] + '/' + i;
				licznik++;
			}
			
			for (let pagination_iterator = 0; pagination_iterator < pagination_links.length; pagination_iterator++) {
				var xhr = new XMLHttpRequest();

				xhr.open("GET", pagination_links[pagination_iterator] );
				xhr.responseType = "document";
				xhr.send();
				await sleep(4000);
				product_links = [];
				
				for (let i = 0; i < xhr.responseXML.querySelectorAll('.products .product a.prodimage').length; i++) {
					product_links[i] = 'https://klamki-online.pl' + xhr.responseXML.querySelectorAll('.products .product a.prodimage')[i].getAttribute('href');
				}
				
				for (let i = 0; i < product_links.length; i++) {
					var xhr = new XMLHttpRequest();

					xhr.open("GET", product_links[i] );
					xhr.responseType = "document";
					xhr.send();
					await sleep(4000);
					var xmlString = "<root></root>";
					var parser = new DOMParser();
					var xmlDoc = parser.parseFromString(xmlString, "text/xml");
					
					var elements = xmlDoc.getElementsByTagName("root");
					var node = xmlDoc.createElement("produkt");
					elements[0].appendChild(node);

					//		SKU
					
					var node = xmlDoc.createElement("SKU");
					elements[0].childNodes[0].appendChild(node);
					elements[0].childNodes[0].childNodes[0].textContent = 'KO-' + product_iterator;
					
					//		Nazwa produktu

					var node = xmlDoc.createElement("nazwa_produktu");
					elements[0].childNodes[0].appendChild(node);
					if ( xhr.responseXML.querySelectorAll('#box_productfull .name') != null ) {
						elements[0].childNodes[0].childNodes[1].textContent = xhr.responseXML.querySelectorAll('#box_productfull .name')[0].innerText;
					} else {
						elements[0].childNodes[0].childNodes[1].textContent = ' ';
					}
					
					//		OPIS
					
					if ( xhr.responseXML.querySelector('#box_description p') != null ) {
						var cdata = xmlDoc.createCDATASection( xhr.responseXML.querySelector('#box_description p').innerHTML );
					} else {
						var cdata = xmlDoc.createCDATASection( ' ' );
					}
					var node = xmlDoc.createElement("opis_produktu");
					elements[0].childNodes[0].appendChild(node);
					elements[0].childNodes[0].childNodes[2].appendChild(cdata);
					
					//		Kategoria
					
					var node = xmlDoc.createElement("kategoria");
					elements[0].childNodes[0].appendChild(node);
					elements[0].childNodes[0].childNodes[3].textContent = kat_names[x];
					
					//		Cena

					var node = xmlDoc.createElement("cena_produktu");
					elements[0].childNodes[0].appendChild(node);
					if ( xhr.responseXML.querySelectorAll('.main-price')[0] != null ) {
						elements[0].childNodes[0].childNodes[4].textContent = xhr.responseXML.querySelectorAll('.main-price')[0].innerText.slice(0, -3);
					} else {
						elements[0].childNodes[0].childNodes[4].textContent = ' ';
					}
					
					// 		URL zdjęć

					if ( xhr.responseXML.querySelectorAll('.innersmallgallery link').length !== 0 ) {
						for (let i = 0; i < xhr.responseXML.querySelectorAll('.innersmallgallery link').length; i++) {
							var node = xmlDoc.createElement("zdjecie" + i);
							elements[0].childNodes[0].appendChild(node);
							elements[0].childNodes[0].childNodes[i+5].textContent = 'https://klamki-online.pl' + xhr.responseXML.querySelectorAll('.innersmallgallery link')[i].getAttribute('href');
						}	
					} else {
						var node = xmlDoc.createElement("zdjecie0");
						elements[0].childNodes[0].appendChild(node);
						if ( xhr.responseXML.querySelectorAll('.mainimg link').length !== 0 ) {
							elements[0].childNodes[0].childNodes[5].textContent = 'https://klamki-online.pl' + xhr.responseXML.querySelectorAll('.mainimg link')[0].getAttribute('href');
						} else {
							elements[0].childNodes[0].childNodes[5].textContent = ' ';
							console.log( 'Brak zdjęcia - ' + xhr.responseXML.querySelectorAll('#box_productfull .name')[0].innerText );
						}
					}
					
					s += xmlDoc.documentElement.innerHTML;
					product_iterator++;
					console.log( kat_names[x] );
				}
			}
			
		} else {
			
			product_links = [];
			for (let i = 0; i < xhr.responseXML.querySelectorAll('.products .product a.prodimage').length; i++) {
				product_links[i] = 'https://klamki-online.pl' + xhr.responseXML.querySelectorAll('.products .product a.prodimage')[i].getAttribute('href');
			}
			
				for (let i = 0; i < product_links.length; i++) {
					var xhr = new XMLHttpRequest();

					xhr.open("GET", product_links[i] );
					xhr.responseType = "document";
					xhr.send();
					await sleep(4000);
					var xmlString = "<root></root>";
					var parser = new DOMParser();
					var xmlDoc = parser.parseFromString(xmlString, "text/xml");
					
					var elements = xmlDoc.getElementsByTagName("root");
					var node = xmlDoc.createElement("produkt");
					elements[0].appendChild(node);

					//		SKU
					
					var node = xmlDoc.createElement("SKU");
					elements[0].childNodes[0].appendChild(node);
					elements[0].childNodes[0].childNodes[0].textContent = 'KO-' + product_iterator;
					
					//		Nazwa produktu

					var node = xmlDoc.createElement("nazwa_produktu");
					elements[0].childNodes[0].appendChild(node);
					if ( xhr.responseXML.querySelectorAll('#box_productfull .name') != null ) {
						elements[0].childNodes[0].childNodes[1].textContent = xhr.responseXML.querySelectorAll('#box_productfull .name')[0].innerText;
					} else {
						elements[0].childNodes[0].childNodes[1].textContent = ' ';
					}
					
					//		OPIS
					
					if ( xhr.responseXML.querySelector('#box_description p') != null ) {
						var cdata = xmlDoc.createCDATASection( xhr.responseXML.querySelector('#box_description p').innerHTML );
					} else {
						var cdata = xmlDoc.createCDATASection( ' ' );
					}
					var node = xmlDoc.createElement("opis_produktu");
					elements[0].childNodes[0].appendChild(node);
					elements[0].childNodes[0].childNodes[2].appendChild(cdata);
					
					//		Kategoria
					
					var node = xmlDoc.createElement("kategoria");
					elements[0].childNodes[0].appendChild(node);
					elements[0].childNodes[0].childNodes[3].textContent = kat_names[x];
					
					//		Cena

					var node = xmlDoc.createElement("cena_produktu");
					elements[0].childNodes[0].appendChild(node);
					if ( xhr.responseXML.querySelectorAll('.main-price')[0] != null ) {
						elements[0].childNodes[0].childNodes[4].textContent = xhr.responseXML.querySelectorAll('.main-price')[0].innerText.slice(0, -3);
					} else {
						elements[0].childNodes[0].childNodes[4].textContent = ' ';
					}
					
					// 		URL zdjęć

					if ( xhr.responseXML.querySelectorAll('.innersmallgallery link').length !== 0 ) {
						for (let i = 0; i < xhr.responseXML.querySelectorAll('.innersmallgallery link').length; i++) {
							var node = xmlDoc.createElement("zdjecie" + i);
							elements[0].childNodes[0].appendChild(node);
							elements[0].childNodes[0].childNodes[i+5].textContent = 'https://klamki-online.pl' + xhr.responseXML.querySelectorAll('.innersmallgallery link')[i].getAttribute('href');
						}	
					} else {
						var node = xmlDoc.createElement("zdjecie0");
						elements[0].childNodes[0].appendChild(node);
						if ( xhr.responseXML.querySelectorAll('.mainimg link').length !== 0 ) {
							elements[0].childNodes[0].childNodes[5].textContent = 'https://klamki-online.pl' + xhr.responseXML.querySelectorAll('.mainimg link')[0].getAttribute('href');
						} else {
							elements[0].childNodes[0].childNodes[5].textContent = ' ';
							console.log( 'Brak zdjęcia - ' + xhr.responseXML.querySelectorAll('#box_productfull .name')[0].innerText );
						}
					}
					
					s += xmlDoc.documentElement.innerHTML;
					product_iterator++;
					console.log( kat_names[x] );
				}

		}
	}
	dp(s);
}

doSomething()