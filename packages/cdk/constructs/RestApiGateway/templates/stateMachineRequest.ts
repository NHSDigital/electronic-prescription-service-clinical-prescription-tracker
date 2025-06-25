/* eslint-disable max-len */
export const stateMachineRequestTemplate = (stateMachineArn: string) => {
  return `## Velocity Template used for API Gateway request mapping template
## "@@" is used here as a placeholder for '"' to avoid using escape characters.

#set($includeHeaders = true)
#set($includeQueryString = true)
#set($includePath = true)
#set($requestContext = '')

#set($inputString = '')
#set($allParams = $input.params())
#set($allParams.header.apigw-request-id = $context.requestId)
{
    "stateMachineArn": "${stateMachineArn}",
    #set($inputString = "$inputString,@@body@@: $input.body")
    #if ($includeHeaders)
        #set($inputString = "$inputString, @@headers@@:{")
        #foreach($paramName in $allParams.header.keySet())
            #set($inputString = "$inputString @@$paramName@@: @@$util.escapeJavaScript($allParams.header.get($paramName))@@")
            #if($foreach.hasNext)
                #set($inputString = "$inputString,")
            #end
        #end
        #set($inputString = "$inputString }")
    #end
    #if ($includeQueryString)
        #set($inputString = "$inputString, @@queryStringParameters@@:{")
        #foreach($paramName in $allParams.querystring.keySet())
            #set($inputString = "$inputString @@$paramName@@: @@$util.escapeJavaScript($allParams.querystring.get($paramName))@@")
            #if($foreach.hasNext)
                #set($inputString = "$inputString,")
            #end
        #end
        #set($inputString = "$inputString }")
    #end
    #if ($includePath)
        #set($inputString = "$inputString, @@pathParameters@@:{")
        #foreach($paramName in $allParams.path.keySet())
            #set($inputString = "$inputString @@$paramName@@: @@$util.escapeJavaScript($allParams.path.get($paramName))@@")
            #if($foreach.hasNext)
                #set($inputString = "$inputString,")
            #end
        #end
        #set($inputString = "$inputString }")
    #end
    ## Check if the request context should be included as part of the execution input
    #if($requestContext && !$requestContext.empty)
        #set($inputString = "$inputString,")
        #set($inputString = "$inputString @@requestContext@@: $requestContext")
    #end
    #set($inputString = "$inputString}")
    #set($inputString = $inputString.replaceAll("@@",'"'))
    #set($len = $inputString.length() - 1)
    "input": "{$util.escapeJavaScript($inputString.substring(1,$len))}"
}`
}
