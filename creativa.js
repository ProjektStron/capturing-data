function dp(textToWrite) {
    if ('Blob' in window) {
        var fileName = "creativa.xml";
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
	
	xhr.open("GET", 'https://creativa24.pl/' );
	xhr.responseType = "document";
	xhr.send();
	await sleep(4000);
	
	for (let i = 0; i < xhr.responseXML.querySelectorAll('#navbarSupportedContent li a').length; i++) {
		kat_links[i] = xhr.responseXML.querySelectorAll('#navbarSupportedContent li a')[i].getAttribute('href');
		kat_names[i] = xhr.responseXML.querySelectorAll('#navbarSupportedContent li a')[i].getAttribute('href').split('/')[3].slice(3);
	}
	
	for (var x = 0; x < kat_links.length; x++) {
		
		var xhr = new XMLHttpRequest();

		xhr.open("GET", kat_links[x] );
		xhr.responseType = "document";
		xhr.send();
		await sleep(4000);
		
		if ( xhr.responseXML.querySelector('nav.pagination').length !== 0 ) {
			
			var last_page = xhr.responseXML.querySelectorAll('nav.pagination li.page').length;
			pagination_links = [];
			pagination_links[0] = kat_links[x];
			
			for (let i = 2; i <= last_page; i++) {
				pagination_links[i] = kat_links[x] + '?page=' + i;
			}
			
			for (let pagination_iterator = 0; pagination_iterator < pagination_links.length; pagination_iterator++) {
				var xhr = new XMLHttpRequest();

				xhr.open("GET", pagination_links[pagination_iterator] );
				xhr.responseType = "document";
				xhr.send();
				await sleep(4000);
				product_links = [];
				
				for (let i = 0; i < xhr.responseXML.querySelectorAll('#js-product-list .product-miniature').length; i++) {
					product_links[i] = xhr.responseXML.querySelectorAll('#js-product-list .product-miniature')[i].querySelector('a').getAttribute('href');
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
					elements[0].childNodes[0].childNodes[0].textContent = 'CRTVA-' + product_iterator;
					
					//		Nazwa produktu
					
					var node = xmlDoc.createElement("nazwa_produktu");
					elements[0].childNodes[0].appendChild(node);
					if ( xhr.responseXML.querySelector('.product-information h1') != null ) {
						elements[0].childNodes[0].childNodes[1].textContent = xhr.responseXML.querySelector('.product-information h1').innerText;
					} else {
						elements[0].childNodes[0].childNodes[1].textContent = ' ';
					}
					
					//		OPIS
					
					if ( xhr.responseXML.querySelector('div[itemprop=description]') != null ) {
						var cdata = xmlDoc.createCDATASection( xhr.responseXML.querySelector('#product-description').innerHTML.slice(0, -133) );
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
					if ( xhr.responseXML.querySelector('span[itemprop=price]') != null ) {
						elements[0].childNodes[0].childNodes[4].textContent = xhr.responseXML.querySelector('span[itemprop=price]').getAttribute('content');
					} else {
						elements[0].childNodes[0].childNodes[4].textContent = ' ';
					}
					
					// 		URL zdjęć
					
					if ( xhr.responseXML.querySelector('.product-cover a') != null ) {
						
						var node = xmlDoc.createElement("zdjecie0");
						elements[0].childNodes[0].appendChild(node);
						elements[0].childNodes[0].childNodes[5].textContent = xhr.responseXML.querySelector('.product-cover a').getAttribute('href');
						
					} else {
						
						var node = xmlDoc.createElement("zdjecie0");
						elements[0].childNodes[0].appendChild(node);
						elements[0].childNodes[0].childNodes[5].textContent = ' ';
						
					}		
					
					// 		Tabelka
					
					if ( xhr.responseXML.querySelector('.product-features') != null ) {
						if ( xhr.responseXML.querySelector('.product-features').querySelector('div') != null ) {
							var cdata = xmlDoc.createCDATASection( xhr.responseXML.querySelector('.product-features').querySelector('div').innerHTML );
						} else {
							var cdata = xmlDoc.createCDATASection( ' ' );
						}
					} else {
						var cdata = xmlDoc.createCDATASection( ' ' );
					}
					var node = xmlDoc.createElement("tabelka");
					elements[0].childNodes[0].appendChild(node);
					elements[0].childNodes[0].childNodes[6].appendChild(cdata);
					
					
					s += xmlDoc.documentElement.innerHTML;
					product_iterator++;
					console.log( kat_names[x] );
				}
			}
			
		} else {
			
				product_links = [];
			
				for (let i = 0; i < xhr.responseXML.querySelectorAll('#js-product-list .product-miniature').length; i++) {
					product_links[i] = xhr.responseXML.querySelectorAll('#js-product-list .product-miniature')[i].querySelector('a').getAttribute('href');
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
					elements[0].childNodes[0].childNodes[0].textContent = 'CRTVA-' + product_iterator;
					
					//		Nazwa produktu
					
					var node = xmlDoc.createElement("nazwa_produktu");
					elements[0].childNodes[0].appendChild(node);
					if ( xhr.responseXML.querySelector('.product-information h1') != null ) {
						elements[0].childNodes[0].childNodes[1].textContent = xhr.responseXML.querySelector('.product-information h1').innerText;
					} else {
						elements[0].childNodes[0].childNodes[1].textContent = ' ';
					}
					
					//		OPIS
					
					if ( xhr.responseXML.querySelector('div[itemprop=description]') != null ) {
						var cdata = xmlDoc.createCDATASection( xhr.responseXML.querySelector('#product-description').innerHTML.slice(0, -133) );
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
					if ( xhr.responseXML.querySelector('span[itemprop=price]') != null ) {
						elements[0].childNodes[0].childNodes[4].textContent = xhr.responseXML.querySelector('span[itemprop=price]').getAttribute('content');
					} else {
						elements[0].childNodes[0].childNodes[4].textContent = ' ';
					}
					
					// 		URL zdjęć
					
					if ( xhr.responseXML.querySelector('.product-cover a') != null ) {
						
						var node = xmlDoc.createElement("zdjecie0");
						elements[0].childNodes[0].appendChild(node);
						elements[0].childNodes[0].childNodes[5].textContent = xhr.responseXML.querySelector('.product-cover a').getAttribute('href');
						
					} else {
						
						var node = xmlDoc.createElement("zdjecie0");
						elements[0].childNodes[0].appendChild(node);
						elements[0].childNodes[0].childNodes[5].textContent = ' ';
						
					}		
					
					// 		Tabelka
					
					if ( xhr.responseXML.querySelector('.product-features') != null ) {
						if ( xhr.responseXML.querySelector('.product-features').querySelector('div') != null ) {
							var cdata = xmlDoc.createCDATASection( xhr.responseXML.querySelector('.product-features').querySelector('div').innerHTML );
						} else {
							var cdata = xmlDoc.createCDATASection( ' ' );
						}
					} else {
						var cdata = xmlDoc.createCDATASection( ' ' );
					}
					var node = xmlDoc.createElement("tabelka");
					elements[0].childNodes[0].appendChild(node);
					elements[0].childNodes[0].childNodes[6].appendChild(cdata);
					
					
					s += xmlDoc.documentElement.innerHTML;
					product_iterator++;
					console.log( kat_names[x] );
				}

		}
	}
	dp(s);
}

doSomething()