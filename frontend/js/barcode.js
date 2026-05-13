// barcode.js
// Função utilitária para gerar código de barras usando JsBarcode

function gerarCodigoBarras(elementId, codigo) {
  if (!window.JsBarcode) {
    console.error('JsBarcode não carregado!');
    return;
  }
  JsBarcode(`#${elementId}`, codigo, {
    format: 'EAN13',
    lineColor: '#000',
    width: 2.5,
    height: 55,
    displayValue: true
  });
}
