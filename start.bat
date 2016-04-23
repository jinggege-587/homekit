@echo off 

echo *********Running Node Server*********
echo Try Stoping Node...
taskkill /F /IM node.exe 
node index

@ echo.
@ echo.
@ echo.
