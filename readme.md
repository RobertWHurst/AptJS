AptJS
=====

**PLEASE NOTE THESE DOCS ARE INCOMPLETE**. They should be finished in a day or two. For now the navigation is missing some links. There may be various errors as well. Examples will be added to above the docs by the end of the week.

An apt solution for control flow JavaScript.

#### Navigation
* [Getting Started](#getting-started)
  * [Working with a Dataset Asynchronously](#working-with-data)
  * [Working with a Dataset in Series](#working-with-data-serial)
* [Documentation](#documentation)
  * [AptJS.map()](#map)
  * [AptJS.map.serial()](#map-serial)
  * [AptJS.map.parallel()](#map-parallel)
  * [AptJS.execute()](#execute)
  * [AptJS.execute.serial()](#execute-serial)
  * [AptJS.execute.parallel()](#execute-parallel)
  * [aptCallback](#aptCallback)

<a name="getting-started"></a>
Getting Started
---------------

<a name="working-with-data"></a>
### Working with a Dataset Asynchronously

####Source

```javascript
var map = AptJS.map.serial({
  "foo", "http://example.com/foo.json",
  "bar": "http://example.com/bar.json",
  "baz": "http://example.com/baz.json"
});

map.on('data', function(url, attempt, worker) {
  if(attempt > 3) { worker.error(new Error('Cannot fetch resource at ' + url + '.')) }
  $.ajax({
    "url": url,
    "success": function(data) { worker.done(data); },
    "error": worker.retry
  });
});

map.on('complete', function(data) {
  console.log(data);
});
```

####Console

```javascript
>>> {
      "foo": "{/* JSON from http://example.com/foo.json */}",
      "bar": "{/* JSON from http://example.com/bar.json */}",
      "baz": "{/* JSON from http://example.com/baz.json */}"
    }
```

```javascript
var map = AptJS.map.parallel({
  "foo", "http://example.com/foo.json",
  "bar": "http://example.com/bar.json",
  "baz": "http://example.com/baz.json"
});
```

<a name="working-with-data-serial"></a>
### Working with a Dataset in Series

<a name="documentation"></a>
Documention
-----------

<a name="parallel"></a>
### Apt.map()

Takes an array of data and iterates over it in batches of a given size.

#### Arguments

```javascript
Apt.parallel(function callback[, ...]) => object executionInstance
```
<table width="100%">
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Allowed Types</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>callback</td>
      <td>A callback you wish to execute in parallel.</td>
      <td>function</td>
    </tr>
  </tbody>
</table>

```javascript
Apt.parallel(array callbacks) => object executionInstance
```
<table width="100%">
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Allowed Types</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>callbacks</td>
      <td>An array of callbacks you wish to execute in parallel.</td>
      <td>array</td>
    </tr>
  </tbody>
</table>

```javascript
Apt.parallel(object callbacks) => object executionInstance
```
<table width="100%">
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Allowed Types</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>callbacks</td>
      <td>An object of callbacks you wish to execute in parallel. The results object will be sorted by the property names associated with each callback.</td>
      <td>object</td>
    </tr>
  </tbody>
</table>


<a name="serial"></a>
### Apt.serial()

Creates a serial execution instance emitter and returns it.

#### Arguments

```javascript
Apt.serial(function aptCallback[, ...]) => object executionInstance
```
<table width="100%">
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Allowed Types</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>aptCallback</td>
      <td>A callback you wish to execute in serial.</td>
      <td>function</td>
    </tr>
  </tbody>
</table>

```javascript
Apt.serial(array aptCallbacks) => object executionInstance
```
<table width="100%">
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Allowed Types</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>aptCallbacks</td>
      <td>An array of callbacks you wish to execute in serial.</td>
      <td>array</td>
    </tr>
  </tbody>
</table>

```javascript
Apt.serial(object aptCallbacks) => object executionInstance
```
<table width="100%">
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Allowed Types</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>aptCallbacks</td>
      <td>An object of callbacks you wish to execute in serial. The results object will be sorted by the property names associated with each callback.</td>
      <td>object</td>
    </tr>
  </tbody>
</table>

<a name="aptCallback"></a>
### aptCallback()

Creates a serial execution instance emitter and returns it.

#### Arguments

```javascript
callback(function executionHandler) => [* result]
```
<table width="100%">
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>executionHandler</td>
      <td>The execution handler.</td>
      <td>function</td>
    </tr>
    <tr>
      <td>result</td>
      <td>Optional. If the callback returns anything other than false its equivelet to calling `done(null, result)` at the end of your function.</td>
      <td>*</td>
    </tr>
  </tbody>
</table>

<a name="executionHandler"></a>
### executionHandler()

The execection handler is passed into every aptCallback. Its ment to be used by your aptCallbacks to signal that they have completed or encountered an error.

#### Arguments

```javascript
executionHandler(error|null|undefined error[, * result[, …]])
```
<table width="100%">
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>error</td>
      <td>Should be an error object if the apt callback encountered an error. Otherwise it should be set to null or undefined.</td>
      <td>error|null|undefined</td>
    </tr>
    <tr>
      <td>result</td>
      <td>Optional. A result you wish to add to the results object passed to complete. This value is namespaced to the current callback index/property name.</td>
      <td>*</td>
    </tr>
  </tbody>
</table>

<a name="executionInstance"></a>
### executionInstance{}

```javascript
executionInstance
  on()
  once()
  ...
```

The executionInstance object is a **LucidJS** emitter. See the [LucidJS readme](https://github.com/RobertWHurst/LucidJS/blob/master/readme.md) for documentation.

<a name="executionInstanceOnComplete"></a>
### executionInstance => 'complete'

The executionInstance emits `complete` when all callbacks have completed successfully.

#### Arguments

```javascript
executionInstance.on('complete', callback(object results))
```
<table width="100%">
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>results</td>
      <td>The results object.</td>
      <td>object</td>
    </tr>
  </tbody>
</table>

<a name="executionInstanceOnError"></a>
### executionInstance => 'error'

The execution instance emits `error` when one or more callbacks pass an error into their execution handler.

#### Arguments

```javascript
executionInstance.on('error', callback(array failureCollection))
```
<table width="100%">
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Types</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>results</td>
      <td>The failureCollection array.</td>
      <td>array</td>
    </tr>
  </tbody>
</table>


