export function qrCodeStringToObject(qrDataString) {
  let [id, name, category, imageUrl, price, unit] = qrDataString.split(',');
  return {
    id: parseInt(id, 10),
    name,
    category,
    imageUrl,
    unit,
    price: parseFloat(price)
  }
}

/**
 * Read an image file into an image buffer.
 * NOTE: This may be important for image processing inside a web worker
 * 
 * @public
 * @param {File} file file for QRcode image (i.e., from an <input type="file" /> )
 * @return {Promise<ImageData>} image buffer pre-loaded with QRcode image
 */
export function fileToImageBuffer(file) {
  return new Promise((resolve /*, reject*/) => {
    var imageType = /^image\//;
    if (!imageType.test(file.type)) {
      throw new Error('File type not valid');
    }
    // Read file
    var reader = new FileReader();
    reader.addEventListener('load', () => {
      let img = new Image();
      let canvas = document.createElement('canvas');
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img,0,0);
        let data = ctx.getImageData(0, 0, img.width, img.height);
        resolve(data);
      }
      img.src = event.target.result;
    }, false);


    reader.readAsDataURL(file);
  });
}

/**
 * Take an image buffer that's pre-populated with a QR code image
 * and process it using the qrcode-reader library. At the end, if all looks
 * well, add the item represented by the QRcode to the cart.
 * 
 * @public
 * @param {ImageData} imageBuffer 
 * @param {CartStore} cartStore
 * @return {Promise}
 */
export function onQrCodeScan(imageBuffer, cartStore) {
  return new Promise((resolve/*, reject*/) => {
    let worker = new Worker('../qr-worker.js');
    worker.postMessage(imageBuffer);
    worker.onmessage = e => {
      resolve(e.data);
    }
  }).then((qrData) => {
    cartStore.addItemToCart(qrData);
  });
}