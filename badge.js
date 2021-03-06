var fs = require('fs');
var path = require('path');
var SVGO = require('svgo');

// Initialize what will be used for automatic text measurement.
var Canvas = require('canvas');
var canvasElement = new Canvas(0, 0);   // Width and height are irrelevant.
var canvasContext = canvasElement.getContext('2d');
var CanvasFont = Canvas.Font;
var color = require('color-string');
try {
  var opensans = new CanvasFont('Verdana',
      path.join(__dirname, 'Verdana.ttf'));
  canvasContext.addFont(opensans);
} catch(e) {}
canvasContext.font = '11px Verdana, "DejaVu Sans"';

// Template crafting action below.
var dot = require('dot');
var colorscheme = require(path.join(__dirname, 'colorscheme.json'));
var template = fs.readFileSync(path.join(__dirname, 'template.svg'));
var imageTemplate;

function optimize(string, callback) {
  var svgo = new SVGO();
  svgo.optimize(string, callback);
}

function makeImage(data, cb) {
   imageTemplate = dot.template(''+(data.template || template));
   data.colorscheme = data.colorscheme.split(",");
   data.image = data.image || undefined;
  if (data.colorscheme) {
    data.colorA =  color.hexString(color.getRgb(data.colorscheme[0]));
	if(data.colorscheme.length > 1){
		data.colorB =  color.hexString(color.getRgb(data.colorscheme[1]));
	}else{
		data.colorB =  color.hexString(color.getRgb(data.colorscheme[0]));
	}
  }
  if(data.font){
	data.fontColor = color.hexString(color.getRgb(data.font));
  }
  data.widths = [
    (canvasContext.measureText(data.text[0]).width|0) + 10,
    (canvasContext.measureText(data.text[1]).width|0) + 10,
  ];
  var result = imageTemplate(data);
  // Run the SVG through SVGO.
  optimize(result, function(object) { cb(object.data); });
}

module.exports = makeImage;
