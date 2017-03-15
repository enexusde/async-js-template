# async-js-template
Asynchron javascript templates

Templateengine for asynchrouneus JSON requests.

## Including into Website
Including the asjst is easy, just include this line anywhere in the header-section of the website.
`<script src="js/asjst.js"></script>`

## Accessing via Servlet

Since Servet specification 3.0 we could access the asjst.js via java-classpath. Requirement is a [servlet-3.0](http://tomcat.apache.org/whichversion.html) container and the `web.xml`-File having at least version 3.0 like this:

```
<web-app version="3.0"> ... </web-app> 
```

Example:
## Access JSON-Values
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
## Loop throu Arrays

This is easy too, just like this

```
   <script id="foobar" type="text/asjstOrWhatever">
{{for peoples}}
  {{name}}
{{/for}}
   </script>
   <button onclick="
      render( 'foobar', 
              {peoples:[{name:'Mike'},{name:'Marry'}]}, 
              function (htmlIncomming) {
                alert(htmlIncomming); // alerts "Mike Marry"
              }
            );">
     Run
   </button>
   ```
## If, else, elseif and endif

```
   <script id="foobar" type="text/asjstOrWhatever">
   {{if age <= 12}}
   Child
   {{else if age <=18}}
   Young person
   {{else if age <= 24}}
   Youngster
   {{else}}
   Adult 
   {{/if}}
   </script>
   <button onclick="
      render( 'foobar', 
              {age: 19}, 
              function (htmlIncomming) {
                alert(htmlIncomming); // alerts "Youngster"
              }
            );">
     Run
   </button>
   ```
## Load (Async)

```
   <script id="foobar" type="text/asjstOrWhatever">
{{load 'http://www.example.de/rest/abc.json'}}
  aha
{{/load}}
   </script>
   <button onclick="
      render( 'foobar', 
              {age: 19}, 
              function (htmlIncomming) {
                alert(htmlIncomming); // alerts "aha"
              }
            );">
     Run
   </button>
   ```
