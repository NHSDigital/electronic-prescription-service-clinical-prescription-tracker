export const stateMachine200ResponseTemplate = `#set($payload = $util.parseJson($input.path('$.output')))
#set($context.responseOverride.status = $payload.Payload.statusCode)
#set($allHeaders = $payload.Payload.headers)
#foreach($headerName in $allHeaders.keySet())
    #set($context.responseOverride.header[$headerName] = $allHeaders.get($headerName))
#end
$payload.Payload.body`
