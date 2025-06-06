const express = require('express');
const pdf = require('html-pdf-chrome');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;


app.use(bodyParser.json({ limit: '5mb' }));

app.post('/generate-pdf', async (req, res) => {
  try {
    const {
      html,
      format = 'A4',
      landscape = false,
      //margins = { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
    } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'El campo "html" es obligatorio.' });
    }

         const body = `
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="UTF-8">
              <link rel="stylesheet" href="https://wkfclient.bsp-inspector.cl/assets/styles/editor.css">
            </head>
            <body>
              ${html}
            </body>
          </html>
        `;
    const result = await pdf.create(body);
    const buffer = await result.toBuffer();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="documento.pdf"',
    });

    res.send(buffer);
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    res.status(500).json({ error: 'Error interno al generar el PDF.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
