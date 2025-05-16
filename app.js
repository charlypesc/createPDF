const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json({ limit: '10mb' }));

app.post('/generate-pdf', async (req, res) => {
    const { html } = req.body;
    try {
        const browser = await puppeteer.launch({
            headless: true,  // Habilita el modo headless (sin interfaz gráfica)
            executablePath: '/usr/bin/google-chrome',  // Ruta del ejecutable si usas Google Chrome en lugar de Chromium
            //executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
            args: [
              '--no-sandbox',  // Desactiva el sandbox (útil en Docker)
              '--disable-setuid-sandbox',  // Otra opción para evitar el sandboxing en contenedores
              '--disable-gpu',  // Desactiva la aceleración de GPU (opcional, si usas un entorno sin gráficos)
              '--disable-software-rasterizer'  // Evita usar un rasterizador software (opcional)
            ]
          });
        const page = await browser.newPage();
        const entireHtml = `
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link rel="stylesheet" href="https://wkfclient.bsp-inspector.cl/assets/styles/editor.css">
            </head>
            <body>
              ${html}
            </body>
          </html>
        `;
        // await page.addStyleTag({
        //     url: 'https://wkfclient.bsp-inspector.cl/assets/styles/editor.css'
        // });
        await page.setContent(entireHtml, { waitUntil: 'networkidle0' });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        const pdfBuffer = await page.pdf({ format: 'Letter' });
        await browser.close();

        res.contentType('application/pdf');
        res.send(pdfBuffer);
    } catch (err) {
        console.error('Error generating PDF:', err);
        res.status(500).send('Error generating PDF '+ err);
    }
});

app.listen(8080, () => console.log('PDF service running on port 8080'));