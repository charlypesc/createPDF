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
            args: [
              '--no-sandbox',  // Desactiva el sandbox (útil en Docker)
              '--disable-setuid-sandbox',  // Otra opción para evitar el sandboxing en contenedores
              '--disable-gpu',  // Desactiva la aceleración de GPU (opcional, si usas un entorno sin gráficos)
              '--disable-software-rasterizer'  // Evita usar un rasterizador software (opcional)
            ]
          });
        const page = await browser.newPage();
        await page.setContent('<head><link rel="stylesheet" href="https://wkfclient.bsp-inspector.cl/styles-WTPOCEGK.css" media="all"></head>'+html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        res.contentType('application/pdf');
        res.send(pdfBuffer);
    } catch (err) {
        console.error('Error generating PDF:', err);
        res.status(500).send('Error generating PDF '+ err);
    }
});

app.listen(8080, () => console.log('PDF service running on port 8080'));