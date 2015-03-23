#-------------------------------------------------------------------------------
# Name:        GeoCanViz_GetMxdElements.py
# Purpose:     Returns a list configurable mxd surround elements
#
#
# Created:     19/01/2015
#-------------------------------------------------------------------------------

import arcpy, os, datetime, logging, numpy, collections, sys
import GeoCanViz_Print_Settings as settings
from collections import OrderedDict

logFileName = 'GeoCanViz_GetMapElements'
configurableElements = ['TEXT_ELEMENT', 'MAPSURROUND_ELEMENT', 'PICTURE_ELEMENT', 'LEGEND_ELEMENT']
elementOrderDefault = '9999#'

# error handling classes
class folderNotExist(Exception):
    def __init__(self, theFolder, theMessage):
        self.Folder = theFolder
        self.Message = theMessage
class fileNotExist(Exception):
    def __init__(self, theFile, theMessage):
        self.File = theFile
        self.Message = theMessage

def validateElementOrder(elements):
       for i,value in enumerate(elements):
            if value.find('#') != 1 :
                elements[i] = elementOrderDefault+value
       return elements

def main():
    startTimeFull = datetime.datetime.now().strftime('%y-%m-%d-%H-%M')
    startTime = datetime.datetime.now().strftime('%y-%m-%d')
    log = open(os.path.join(settings.LOGLOCATION, '{0}_{1}.{2}'.format(logFileName, startTime, 'txt')), 'a')
    log.write('----------------------------\n')
    log.write('Process Started: {0}\n'.format(startTimeFull))
    templateName = arcpy.GetParameterAsText(1)
    lang = arcpy.GetParameterAsText(3)
    log.write('Accessing template\n')

    try:
        mxdPath = os.path.join(settings.MXDTEMPLATEFOLDER, lang)
        if not os.path.isdir(mxdPath):
            raise folderNotExist(mxdPath, 'Folder does not exist on server: {0}\n'.format(mxdPath))
        mxdTemplate = os.path.join(mxdPath, templateName)
        if not os.path.exists(mxdTemplate):
            raise fileNotExist(mxdTemplate, 'File does not exist on server: {0}\n'.format(mxdTemplate))

        mapDocument = arcpy.mapping.MapDocument(mxdTemplate)
        mapElements = arcpy.mapping.ListLayoutElements(mapDocument)

        mapElement = [element.name + ':' + element.type for element in mapElements if element.type in configurableElements]
        mapElement = validateElementOrder(mapElement)
        mapElement.sort(key=lambda x: int(x[0:x.index('#')]))

        #remove duplicate named elements
        uniqueElements = OrderedDict.fromkeys(mapElement).keys()
        arcpy.SetParameterAsText(0, ','.join(uniqueElements))

        del mapDocument
        endTime = datetime.datetime.now().strftime('%y-%m-%d-%H-%M-%S')
        log.write('Process Ended: {0}\n'.format(endTime))

    except folderNotExist as ex:
        log.write(ex.Message)
        arcpy.AddError(ex.Message)
        arcpy.SetParameterAsText(2, ex.Message)
    except fileNotExist as ex:
        log.write(ex.Message)
        arcpy.AddError(ex.Message)
        arcpy.SetParameterAsText(2, ex.Message)
    except Exception, e:
        arcpy.AddError(arcpy.GetMessage(2))
        arcpy.SetParameterAsText(2, arcpy.GetMessage(2))
        log.write(arcpy.GetMessage(2))
    finally:
        log.close()
        sys.exit()

if __name__ == '__main__':
    main()
