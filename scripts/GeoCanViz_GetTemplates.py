#-------------------------------------------------------------------------------
# Name:        GeoCanViz_GetPrintTemplates
# Purpose:     Returns list of templates to GCVIZ
#              Hanldes both html and mxd templates
#
# Created:     24/02/2015
#-------------------------------------------------------------------------------

import arcpy, sys, os, datetime, logging
import GeoCanViz_Print_Settings as settings

logFileName ="GeoCanViz_GetTemplates"
NO_TEMPLATES_FOUND = "NO_TEMPLATES"

# error handling classes
class folderNotExist(Exception):
    def __init__(self, theFolder, theMessage):
        self.Folder = theFolder
        self.Message = theMessage

def main():
     try:
        startTimeFull = datetime.datetime.now().strftime('%y-%m-%d-%H-%M')
        startTime = datetime.datetime.now().strftime('%y-%m-%d')
        log = open(os.path.join(settings.LOGLOCATION,"{0}_{1}.{2}".format(logFileName,startTime,"txt")),"a")
        log.write("----------------------------\n")
        log.write("Process Started: {0}\n".format(startTimeFull))
        folder = arcpy.GetParameterAsText(0)
        printType = arcpy.GetParameterAsText(1)
        layoutType = arcpy.GetParameterAsText(4)
        if printType == "mxd":
            root = os.path.join(settings.MXDTEMPLATEFOLDER,folder);
        else:
            root = os.path.join(settings.HTMLTEMPLATEFOLDER,folder);

        log.write("root:{0}\n".format(root))
        templates = [];

        if not os.path.isdir(root):
            raise folderNotExist(root,'Folder does not exist on server: {0}\n'.format(root))

        for path, subdirs, files in os.walk(root):
            for name in files:
                 if name.endswith(printType):
                    relDir = os.path.relpath(path, root)
                    if layoutType.upper() in relDir.upper():
                        if relDir != ".":
                            relFile = os.path.join(relDir, name)
                        else:
                            relFile = name
                        templates.append(relFile);
                        log.write("file:{0}\n".format(relFile))

        if not templates:
           arcpy.SetParameterAsText(2, "NO_TEMPLATES_FOUND")
        else:
           arcpy.SetParameterAsText(2, ','.join(templates))
        endTime = datetime.datetime.now().strftime('%y-%m-%d-%H-%M')
        log.write("Process Ended: {0}\n".format(endTime))

     except folderNotExist as ex:
        log.write(ex.Message)
        arcpy.AddError(ex.Message)
        arcpy.SetParameterAsText(3, ex.Message)
     except Exception, e:
        arcpy.AddError(arcpy.GetMessage(2))
        arcpy.SetParameterAsText(3, arcpy.GetMessage(2))
        log.write(arcpy.GetMessage(2))
     finally:
        log.close()
        sys.exit()

if __name__ == '__main__':
    main()
