# async-js-template
Asynchron javascript templates

Templateengine for asynchrouneus JSON requests.

Example:
## Acces JSON-Values
```
   <script id="foobar" type="text/asjstOrWhatever">
      {{myFantasticField}}
   </script>
   <button onclick="
      render( 'foobar', 
              {myFantasicField:'hello'}, 
              function (htmlIncomming) {
                alert(htmlIncomming); // alerts "hello"
              }
            );">
     Run
   </button>
   ```
