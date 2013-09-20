/*!
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Generate en.js and fr.js language files when build
 */

(function($) {

	var dirObj = new java.io.File('.'),
		csvPath = (dirObj.getAbsolutePath().replace('.', '') + 'src/js/i18n/'),
		destPath = (dirObj.getAbsolutePath().replace('.', '') + 'dist/js/'),
		outEn = new java.io.File(destPath + 'en-min.js'),
		outFr = new java.io.File(destPath + 'fr-min.js'),
		buffEn = new java.io.BufferedWriter(new java.io.FileWriter(outEn));
		buffFr = new java.io.BufferedWriter(new java.io.FileWriter(outFr));
		reader = new java.io.FileReader(csvPath + 'i18n.csv'),
		buffReader = new java.io.BufferedReader(reader);
		line = buffReader.readLine(),
		list = [],
		preFunct = '(function() {define([], function () {"use strict";var getDict,dict={',
		postFunct = '}; getDict = function(val) {return dict[val];};return {getDict: getDict};});}).call(this);';
		en = preFunct,
		fr = preFunct;
	
	// Read the first entry (skip header)
	line = buffReader.readLine()
	while (line !== null) {
		
		list = line.split('#');

		// create English string
		en += '"' + list[1] + '":"' + list[2] + '",';
		
		// create French string
		fr += '"' + list[1] + '":"' + list[3] + '",';
		
		line = buffReader.readLine();
	}
	
	en += postFunct;
	fr += postFunct;
          
	buffEn.write(en);
	buffEn.close();
	
	buffFr.write(fr);
	buffFr.close();

}).call(this);
