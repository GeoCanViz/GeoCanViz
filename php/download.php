<?php
if(empty($_POST['filename']) || empty($_POST['content']) || empty($_POST['filetype'])){
	phpinfo();
	exit;
}

$filename = preg_replace('/[^a-z0-9\-\_\.]/i','',$_POST['filename']);
$filetype = $_POST['filetype'];

header('Cache-Control: ');
header('Content-type: '.$filetype.'; charset=utf-8');
header('Content-Disposition: attachment; filename="'.$filename.'"');

echo $_POST['content'];
?>