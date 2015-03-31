#-------------------------------------------------------------------------------
# Name:        GeoCanViz_AdvanacedPrint.py
# Purpose:     Populates map surrounds based on user input and creates pdf print
#
#
# Created:     12/01/2015
#
#-------------------------------------------------------------------------------

import arcpy, os, datetime, logging, numpy, json, uuid, urllib2
import GeoCanViz_Print_Settings as settings

logFileName = 'GeoCanViz_AdvPrint'

# error handling classes
class folderNotExist(Exception):
    def __init__(self, theFolder, theMessage):
        self.Folder = theFolder
        self.Message = theMessage
class fileNotExist(Exception):
    def __init__(self, theFile, theMessage):
        self.File = theFile
        self.Message = theMessage
class layerVisibilityError(Exception):
    def __init__(self, mxdCount, webCount, theMessage):
        self.mxdLayerCount = mxdCount
        self.webLayerCount = webCount
        self.Message = theMessage
class elementNotExist(Exception):
    def __init__(self, theElement, theMessage):
        self.Element = theElement
        self.Message = theMessage
class duplicateElementNameError(Exception):
    def __init__(self, theElement, theMessage):
        self.Element = theElement
        self.Message = theMessage

def getTemplateElement(mapElements, elementName):
    mapElement = [x for x in mapElements if x.name.strip().upper() == elementName]
    if len(mapElement) == 0:
        raise elementNotExist(elementName, 'Element {0} does not exist in template'.format(elementName))
    if mapElement:
        return mapElement[0]
    else:
        return none

#move element outside layout view, cannot delete map surround elements
def moveMapSurroundElement(mapElements, elementName):
    foundElement = getTemplateElement(mapElements, elementName)
    if(foundElement):
        foundElement.elementPositionX = -10 - foundElement.elementWidth
        foundElement.elementPositionY = -10 - foundElement.elementHeight
    else:
        raise elementNotExist(elementName, 'Element {0} does not exist in template'.format(elementName))

def removeMapElement(mapElements, elementName):
    foundElement = getTemplateElement(mapElements, elementName)
    if(foundElement):
        foundElement.remove()
    else:
        raise elementNotExist(elementName, 'Element {0} does not exist in template'.format(elementName))

def main():

    startTimeFull = datetime.datetime.now().strftime('%y-%m-%d-%H-%M')
    startTime = datetime.datetime.now().strftime('%y-%m-%d')
    log = open(os.path.join(settings.LOGLOCATION, '{0}_{1}.{2}'.format(logFileName, startTime, 'txt')), 'a')
    log.write('----------------------------\n')
    log.write('Process Started: {0}\n'.format(startTimeFull))
    log.write('Map: {0}\n'.format(arcpy.GetParameterAsText(0)))
    log.write('Format: {0}\n'.format(arcpy.GetParameterAsText(1)))
    log.write('TemplateName: {0}\n'.format(arcpy.GetParameterAsText(2)))
    log.write('Lang: {0}\n'.format(arcpy.GetParameterAsText(3)))
    log.write('CenterPointExtent: {0}\n'.format(arcpy.GetParameterAsText(4)))
    log.write('Scale: {0}\n'.format(arcpy.GetParameterAsText(5)))
    log.write('LayoutElements: {0}\n'.format(arcpy.GetParameterAsText(6)))

    try:

##        Web_Map_as_JSON = '{"mapOptions":{"showAttribution":false,"extent":{"xmin":-8344271.65541982,"ymin":5616761.263257239,"xmax":-8301466.9195801793,"ymax":5639692.3717427608,"spatialReference":{"wkid":3857}},"spatialReference":{"wkid":3857}},"operationalLayers":[{"id":"013f40e0-e2f0-a8db-2377-966b05914123","title":"013f40e0-e2f0-a8db-2377-966b05914123","opacity":1,"minScale":144447.638572,"maxScale":4513.988705,"url":"http://nrcan/arcgis/rest/services/TestCache/MapServer"},{"id":"6be26697-4d66-6003-4382-4b1aa327a3d3","title":"6be26697-4d66-6003-4382-4b1aa327a3d3","opacity":1,"minScale":144447.638572,"maxScale":4513.988705,"url":"http://nrcan/arcgis/rest/services/testdata/MapServer"},{"id":"gcviz-symbol","opacity":1,"minScale":0,"maxScale":0,"featureCollection":{"layers":[]}},{"id":"map3_holder_graphics","opacity":1,"minScale":0,"maxScale":0,"featureCollection":{"layers":[]}}],"exportOptions":{"outputSize":[null,null],"dpi":96}}'
##        Web_Map_Decode = json.loads(Web_Map_as_JSON)
##        templateName = "A4 Portrait"
##        lang = "EN"
##        preserve_centerPoint =" "#"-8328684.938:5626421.593"#"-9996438.076:6965545.390"#"-8319825.306:5626829.433"
##        scale = "5000"
##        outputType = "PDF"
##        layoutElements1 = '{"2#Sub Title":"dddd","1#Title":" ","4#Scale Bar":"false","9999#North Arrow":"false"}';
##        log.write('Map: {0}\n'.format(Web_Map_as_JSON))

##        Web_Map_as_JSON = '{"mapOptions":{"showAttribution":false,"extent":{"xmin":-8317543.8623287827,"ymin":5629365.8564837528,"xmax":-8312193.2703486793,"ymax":5632232.2450445229,"spatialReference":{"wkid":3857}},"spatialReference":{"wkid":3857}},"operationalLayers":[{"id":"013f40e0-e2f0-a8db-2377-966b05914123","title":"013f40e0-e2f0-a8db-2377-966b05914123","opacity":1,"minScale":144447.638572,"maxScale":4513.988705,"url":"http://nrcan/arcgis/rest/services/TestCache/MapServer"},{"id":"6be26697-4d66-6003-4382-4b1aa327a3d3","title":"6be26697-4d66-6003-4382-4b1aa327a3d3","opacity":1,"minScale":144447.638572,"maxScale":4513.988705,"url":"http://nrcan/arcgis/rest/services/testdata/MapServer"},{"id":"gcviz-symbol","opacity":1,"minScale":0,"maxScale":0,"featureCollection":{"layers":[]}},{"id":"map3_holder_graphics","opacity":1,"minScale":0,"maxScale":0,"featureCollection":{"layers":[]}}],"exportOptions":{"outputSize":[null,null],"dpi":300}}'
##        Web_Map_Decode = json.loads(Web_Map_as_JSON)
##        templateName = "A3 Landscape Small"
##        lang = "EN"
##        preserve_centerPoint ="-8314868.566338731:5630799.050764138"#"-8328684.938:5626421.593"#"-9996438.076:6965545.390"#"-8319825.306:5626829.433"
##        scale = "5000"
##        outputType = "PDF"
##       #layoutElements1 = '{"Title":" ","North Arrow":"true"}' #{"Title":"asdfasdf","North Arrow":"false"}
##        layoutElements1 = '{"Sub Title":" ","Title":" ","Author":" ","Map Document Credits":" ","Date":" ","Service Layer Credits":" ","Scale Bar":"false","Scale Text":"false","North Arrow":"false","Logo":""}';
##        log.write('Map: {0}\n'.format(Web_Map_as_JSON))

        Web_Map_as_JSON = arcpy.GetParameterAsText(0)
        Web_Map_Decode = json.loads(arcpy.GetParameterAsText(0))
        templateName = arcpy.GetParameterAsText(2)
        lang = arcpy.GetParameterAsText(3)
        preserve_centerPoint = arcpy.GetParameterAsText(4)
        scale = arcpy.GetParameterAsText(5)
        outputType = arcpy.GetParameterAsText(1)
        layoutElements1 = arcpy.GetParameterAsText(6)

        layoutElements = json.loads(layoutElements1)
        exportOptions = Web_Map_Decode['exportOptions']
        extent = Web_Map_Decode['mapOptions']['extent']
        outputDPI = Web_Map_Decode['exportOptions']['dpi']
        log.write('Output DPI: {0}\n'.format(outputDPI))

        #Access template
        log.write('Accessing template\n')
        mxdPath = os.path.join(settings.MXDTEMPLATEFOLDER, lang)
        if not os.path.isdir(mxdPath):
              raise folderNotExist(mxdPath, 'Folder does not exist on server: {0}\n'.format(mxdPath))
        mxdTemplate = os.path.join(mxdPath, templateName) # + ".mxd")
        if not os.path.exists(mxdTemplate):
                raise fileNotExist(mxdTemplate, 'File does not exist on server: {0}\n'.format(mxdTemplate))

        # Convert the WebMap to a map document
        result = arcpy.mapping.ConvertWebMapToMapDocument(Web_Map_as_JSON, mxdTemplate)
        mapDocument = result.mapDocument

        #access the data frame, ConvertWebMapToMapDocument changes dataframe name to WebMap
        log.write('Accessing the Data Frame\n')
        dataFrame = arcpy.mapping.ListDataFrames(mapDocument, 'Webmap')[0]

        #if force extent is used, get centerpoint, create small extent then add scale.
        if len(preserve_centerPoint.strip()) > 0:
            split_center = preserve_centerPoint.split(':')
            log.write('Accessing the Center Point\n')
            newExtent = dataFrame.extent
            newExtent.XMin =  float(split_center[0]) - 10
            newExtent.YMin = float(split_center[1]) - 10
            newExtent.XMax = float(split_center[0]) + 10
            newExtent.YMax  = float(split_center[1]) + 10
            dataFrame.extent = newExtent
            log.write('Setting scale\n')
            dataFrame.scale = long(scale)

        # handle layout elements
        if len(layoutElements) > 0:
            mapElements = arcpy.mapping.ListLayoutElements(mapDocument)
            for mapElement in mapElements:
                elementName = mapElement.name.strip()
                if elementName in layoutElements:
                    if mapElement.type == 'TEXT_ELEMENT':
                        mapElement.text = layoutElements[elementName]
                    if mapElement.type == 'MAPSURROUND_ELEMENT' or mapElement.type == 'LEGEND_ELEMENT':
                        if (layoutElements[elementName] == 'false'):
                            mapElement.elementPositionX = -10 - mapElement.elementWidth
                            mapElement.elementPositionY = -10 - mapElement.elementHeight
                    if mapElement.type == 'PICTURE_ELEMENT':
                        imgDetails = layoutElements[elementName]
                        if(imgDetails == ''):
                            mapElement.elementPositionX = -10 - mapElement.elementWidth
                            mapElement.elementPositionY = -10 - mapElement.elementHeight
                        else:
                            mapElement.sourceImage = imgDetails

        serviceLayersNames = [slyr.name for slyr in arcpy.mapping.ListLayers(mapDocument, data_frame=dataFrame)
                      if slyr.isServiceLayer and slyr.visible and not slyr.isGroupLayer]

        print 'service'
        print serviceLayersNames

        vectorLayersNames = [vlyr.name for vlyr in arcpy.mapping.ListLayers(mapDocument, data_frame=dataFrame)
                     if not vlyr.isServiceLayer and not vlyr.isGroupLayer and vlyr.name != "polylineLayer"]

        print 'vector'
        print vectorLayersNames

        removeLayerNameList = [vlyrName for vlyrName in vectorLayersNames
                       if vlyrName not in serviceLayersNames]

        print 'remove'
        print removeLayerNameList

        # Remove all vector layers that don't have a corresponding service layer
        for lyr in arcpy.mapping.ListLayers(mapDocument, data_frame=dataFrame):
            if not lyr.isGroupLayer \
            and not lyr.isServiceLayer \
            and lyr.name in removeLayerNameList \
            and lyr.name in vectorLayersNames:
                arcpy.mapping.RemoveLayer(dataFrame, lyr)

       # Remove all service layers that have a corresponding vector layer
       # Keep any user added layers
       # This will leave only vector layers that had corresponding service layers
       # WorkAround to NIM092553, cannot check service properties in 10.1, cannot tell if cache or map service
        for slyr in arcpy.mapping.ListLayers(mapDocument, data_frame=dataFrame):
            if slyr.isServiceLayer:
             if slyr.isGroupLayer:
                url = [item['url'] for item in Web_Map_Decode['operationalLayers']
                         if item['id'] == slyr.name]
                if url:
                    response = urllib2.urlopen(url[0] + '?f=json')
                    result = json.loads(response.read())
                    # if true then cache, all layers need to be present to remove group
                    missingVector = False;
                    for glyr in arcpy.mapping.ListLayers(slyr):
                        if glyr != slyr:
                            if glyr.name not in vectorLayersNames:
                                missingVector = True;
                    if (result['singleFusedMapCache'] == True and not missingVector) or \
                        (result['singleFusedMapCache'] == False and not missingVector): #if group layer checked and sublayers unchecked will rasterize output, loses 300 DPI
                        arcpy.mapping.RemoveLayer(dataFrame, slyr)
             elif slyr.name in vectorLayersNames:
                arcpy.mapping.RemoveLayer(dataFrame, slyr)

        arcpy.RefreshTOC()
        arcpy.RefreshActiveView()
        log.write('exporting to pdf at specified resolution\n')

        output = 'ap_{}'.format(str(uuid.uuid1()))
        Output_File = os.path.join(arcpy.env.scratchFolder, output)
        Output_File = Output_File + '.pdf'
        arcpy.mapping.ExportToPDF(mapDocument, Output_File, resolution=int(outputDPI))
        print Output_File
        #parameter from server job needs to be the created file
        arcpy.SetParameterAsText(7, Output_File)

        #clean up
        filePath = mapDocument.filePath
        del mapDocument, result
        os.remove(filePath)

        endTime = datetime.datetime.now().strftime('%y-%m-%d-%H-%M')
        log.write('Process Ended: {0}\n'.format(endTime))

    except folderNotExist as ex:
        log.write(ex.Message)
        arcpy.AddError(ex.Message)
        arcpy.SetParameterAsText(8, ex.Message)
    except fileNotExist as ex:
       log.write(ex.Message)
       arcpy.AddError(ex.Message)
       arcpy.SetParameterAsText(8, ex.Message)
    except duplicateElementNameError as ex:
       log.write(ex.Message)
       arcpy.AddError(ex.Message)
       arcpy.SetParameterAsText(8, ex.Message)
    except elementNotExist as ex:
       log.write(ex.Message)
       arcpy.AddError(ex.Message)
       arcpy.SetParameterAsText(8, ex.Message)
    except ValueError, e:
        log.write(e.message);
        pass
    except Exception, e:
        arcpy.AddError(arcpy.GetMessage(2))
        arcpy.SetParameterAsText(8, arcpy.GetMessage(2))
        log.write(arcpy.GetMessage(2))
    finally:
        log.close()
        sys.exit()

if __name__ == '__main__':
    import sys
    main()
    sys.exit(0)

