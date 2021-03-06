<h1 align="center">Rapier - REST APIs from Entities and Relationships</h1>

<div>
<p align="center"><img src='https://raw.githubusercontent.com/apigee-labs/rapier/master/RapierThumb.jpg'></p>
<h2 align="center">Cut through the tedium of API specifications</h2>
</div>
<table>
  <tr>
    <td><a href="#introduction">Introduction</a></td>
    <td><a href="#news">News</a></td>
    <td><a href="#tutorial">Tutorial</a></td>
    <td><a href="#install">Install</a></td>
    <td><a href="#specification">Specification</a></td>
  </tr>
  <tr>
    <td><a href="#navigating">Navigating the Repository</a></td>
    <td><a href="#oas_generator">OpenAPI Generator</a></td>
    <td><a href="#html_generator">HTML Generator</a></td>
    <td><a href="#validator">Validator</a></td>
    <td><a href="#sdk_generators">SDK Generators</a></td>
  </tr>
</table>

## <a name="introduction"></a>Introduction

[Rapier](https://github.com/apigee-labs/rapier) is a new (2015) API specification language created by [Apigee](http://apigee.com). The goals of Rapier are to allow REST APIs to be specified and learned with one tenth the effort required with other API specification languages, and to
produce specifications that describe higher quality APIs <a href="#footnote1" id="ref1"><sup>1</sup></a>.

You specify an API with Rapier by specifying in YAML the entities and relationships of the data model that underlies the API, along with query paths traversing the relationships. The details of the API's 
HTTP messages are deduced from this specification using the standard patterns described in the HTTP specifications, plus a few conventions 
that we have added. Rapier thereby eliminates the need to repetitively document individual URLs and their methods, which vary only in the entities 
they accept and return or the queries they express.

Rapier is for specifying new APIs. You will not be able to describe existing APIs with Rapier unless that API uses the same conventions that 
Rapier does and is perfectly consistent in applying them.

Rapier takes a data-oriented approach to API design, which aligns with the model of the world-wide-web. If your mental model of
an API is a network of HTTP resources identified and located using URLs, you should be comfortable with Rapier. If you think of a web API
as a set of 'end-points' with 'parameters' (a traditional service-oriented or RPC model), the Rapier approach may not resonate with you.

While Rapier APIs conform to the constraints of REST, including the provision of links in the data, Rapier APIs do not require clients
to be written in any special way—most clients of Rapier APIs are quite conventional <a href="#footnote2" id="ref2"><sup>2</sup></a>. Rapier does
not require or promote any particular hypermedia format—any method of representing URLs that can be described with [JSON Schema](http://json-schema.org/)
is compatible with Rapier.

Since the Rapier specification language is not yet widely 
known and adopted, we provide a tool that will generate an OpenAPI (formerly known as Swagger)
document from a Rapier specification. The generated OpenAPI document allows 
you to learn the precise details of the HTTP messages implied by your Rapier specification, the HTTP standards and our additional conventions.
Generating OpenAPI documents is also useful for integrating with tools that are based on OpenAPI, or for communicating with
people who know OpenAPI but not Rapier. Even if you adopt Rapier enthusiastically, OpenAPI will likely remain important to you for documenting APIs that follow a service-oriented rather than a data-oriented design pattern, 
or follow different conventions to the ones Rapier currently understands, or are less consistent than Rapier APIs. Rapier is designed to complement, not replace, OpenAPI.

Rapier also includes SDK generators for Javascript and Python, a validator and an HTML generator. In the future we may work on test tools, and server implementation frameworks.  

<a name="footnote1"><sup>1</sup></a> Following Fred Brooks, we take consistency as the primary measure of quality of an API. 
“Blaauw and I believe that consistency underlies all principles. A good architecture is consistent in the sense that, given a partial knowledge of the system, one can predict 
the remainder” - Fred Brooks, "The Design of Design", 2010. <a href="#ref1">↩</a>

<a name="footnote2"><sup>2</sup></a> All Rapier APIs are fully linked, in the sense that any resource that a client can address
by composing URLs can also be reached by following links. [There can be exceptions for unbounded sets of related resources, where complete linking is not possible.] It is thus possible to write a general client that
has no a-priori knowledge of any specific Rapier API and navigates APIs only by following links. General software is more difficult to design and
write than specific software—we believe clients that work this way are written primarily when their costs, like those of browsers and web bots, can be 
amortized across many APIs and the cost and time to code to each API specifically is prohibitive. The primary reason for basing Rapier APIs on
hypermedia is to make APIs that are easier to understand and learn and to make all clients easier to write—supporting 
general clients is an additional benefit. <a href="#ref2">↩</a>

## <a name="news"></a>News

April 2 2016:

A validator and an html generator are now provided. For more detail, see [HTML Generator](#html_generator) and [Validator](#validator)

April 4 2016:

The utilities now support relative references between files on the same file-system. HTTP URI references
are not yet supported.
 
April 28 2016:

Added support for [URI Templates](#templates).

May 4, 2016:

Renamed snake_case properties to match camelCase style of JSON Schema.

September 14, 2016:

Rapier generation utilities are available as a command installed using `pip install rapier` or `easy_install rapier`.

## <a name="install"></a>Install

Rapier is available as a command installed using `pip install rapier` or `easy_install rapier`. 

The usage is `rapier [-v, --validate] [-p, --gen-python] [-j, --gen-js] [-m, --yaml-merge] [-i, --include-impl] [-t --suppress-templates] filename`

`rapier myRapierSpec.yaml` will write an OpenAPI (formerly known as Swagger) document to stdout. See [OpenAPI Generator](#oas_generator) for a description of other flag that can be used here.

`rapier -p myRapierSpec.yaml` will write an python SDK file to stdout.

`rapier -j myRapierSpec.yaml` will write a JavaScripot SDK file to stdout.

`rapier -v myRapierSpec.yaml` will write a JavaScripot SDK file to stdout.
 
## <a name="tutorial"></a>Tutorial

Rapier is a small extension to [JSON Schema](http://json-schema.org/) and should be easy to understand and learn if you already know that standard. 
If you are not familiar with [JSON Schema](http://json-schema.org/), you should spend a few minutes getting some level of understanding of what it looks like and what it does. 
Using JSON Schema as a data modelling language does not prevent Rapier APIs from supporting
other media types like YAML, XML or the various RDF formats. 

We think the easiest way to learn Rapier is by example. 

### Hello World

Here is a 'Hello-world' example in Rapier:
```yaml
title: Hello World API
entities:
  HelloMessage:
    wellKnownURLs: /message
    properties:
      text:
        type: string
```                    
This is the complete Rapier specification of the API. The `title`, `entities` and `wellKnownURLs` elements are specific to Rapier. The `properties` element is standard JSON Schema.
The API described by this Rapier specification exposes a single resource whose type is `HelloMessage` (a JSON Schema schema) at the URL `/message`. This resource has a single property called `text`.
The API does not allow this resource to be deleted, because it is well-known, but it does allow it to be
retrieved using GET and modified using PATCH <a href="#footnote3" id="ref3"><sup>3</sup></a>. You don't have to say this explicitly — it is implied by the standard HTTP patterns and our conventions. Rapier also assumes that a GET response
includes an ETag header that must be echoed in the 'If-Match' request header of the PATCH. This catches problems when two people try to update the resource at the same time.

We don't have to specify the details of the methods, requests and responses of the API in Rapier,
because these details are already specified in the HTTP standards. Specifying the details of individual requests and responses would only be useful for documenting
ways in which they diverge from the standards—Rapier assumes they follow them.
Where the standards offer options, Rapier picks defaults and lets you
override these defaults in the `conventions` section of the Rapier document [sometimes—that part of Rapier needs more work].

The `Hello-message` at `/message` will look like this:
```json
    {"text": "Hello, world"}
``` 
We know the JSON will look like this from the rules of JSON Schema <a href="#footnote4" id="ref4"><sup>4</sup></a>—this is not specific to Rapier.

The OpenAPI document generated from this Rapier specification can be [found here](https://github.com/apigee-labs/rapier/blob/master/util/test/gen_openapispec/hello-message.yaml). 
An explanation of the generator output can be found [here](#openapi_generator_output).

<a name="footnote3"><sup>3</sup></a> Rapier assumes PATCH for structured objects and PUT for unstructured or semi-structured documents <a href="#ref3">↩</a>

<a name="footnote4"><sup>4</sup></a> Since we didn't use a `required` property in our JSON Schema, and since we didn't disallow `additionalProperties`, the JSON Schema really only says that the JSON *may* look like this <a href="#ref4">↩</a>

### Single-valued relationship — Webmaster

The next step beyond our simple hello-world example is to show a Rapier API that illustrates a relationship:

```yaml
title: Site Webmaster API
entities:
  Site:
    wellKnownURLs: /
    properties:
      webmaster:
        type: string
        format: uri
        relationship: '#Person'
  Person:
    properties:
      name:
        type: string
```

Here you see the JSON Schema definition of a property called webmaster whose value is a URI. The extra Rapier property `relationship` tells you that the entity
that is identified by that URI is a Person. Since Rapier is designed to describe HTTP APIs, we further assume that the URI will be an HTTP URL
that supports methods like GET, PATCH, DELETE, OPTIONS, and HEAD. As mentioned above, we don't have to specify the details of the requests and responses for these methods in the Rapier document,
because these details are already specified in the HTTP standards.
The [OpenAPI document](https://github.com/apigee-labs/rapier/blob/master/util/test/gen_openapispec/todo-list-basic.yaml) generated from this example spells out all the detail.
An explanation of the generator output can be found [here](#openapi_generator_output).

In JSON, the `Site` at `/` will look like this:
```json
    {"webmaster": "http://example.org/xxxxx"}
```
The `Person` at `http://example.org/xxxxx` will look like this in JSON:
```json
    {"name": "Jane Doe"}
``` 

### <a name="to_do_list"></a>Multi-valued relationship — To-do List

The example above shows how to declare a single-valued realtionship. Here is what it looks like if your relationship is multi-valued:

```yaml
title: Todo List API
entities:
  TodoList:
    wellKnownURLs: /
    readOnly: true
    properties:
      todos:
        type: string
        format: uri
        relationship:
          collectionResource: '#Collection'
          entities: '#Item'
          multiplicity: 0:n
    queryPaths: todos
  Item:
    properties:
      description:
        type: string
      due:
        type: string
        format: date-time
  Collection:
    readOnly: true
    properties:
      contents:
        type: array
        items: 
          $ref: '#/entities/Item'
```

This API defines a single resource at the well_known_URL `/` whose type is `ToDoList`. You can see that each `ToDoList` has a relationship 
property called `todos`. In addition to declaring the entity type at the end of the relationship, we declare the type of the resource that will be used to hold the list of 
entities of the relationship. This is specified in the `collectionResource` property. When `collectionResource` is present, the relationship property (`todos` in this case) is assumed to be
a URL that will point to a resource of this type. Clients can perform a GET on this resource to obtain information on the entities of the
relationship and can POST to make new ones.

In JSON, the `ToDoList` at `/` will look like this:
```json
    {"todos": "http://example.org/xxxxx"}
```
The `Collection` at `http://example.org/xxxxx` will look like this in JSON:
```json
    {"contents": [
         {"description": "Get milk on the way home",
          "due": "2016-10-30T09:30:10Z"
         }
      ]
    }
``` 

The format of the resource for multi-valued relationships is under the control of the Rapier author - the Collection format used here is just an example.

Unless you say otherwise, Rapier will assume that clients can POST to the collection for a multi-valued relationship to create new entities. You can overide this assumption by marking the relationship as readOnly.
By default, you create a new entity by POSTing an entity of the type you want to create. Sometimes you want to create entities by POSTing an entity that is different from the one 
you are trying to create, with the server doing the conversion. [This example](https://github.com/apigee-labs/rapier/blob/master/util/test/ssl.yaml) illustrates how you can express that case in Rapier. 

If you want to see the generated OpenAPI document for this API specification, [it is here](https://github.com/apigee-labs/rapier/blob/master/util/test/gen_openapispec/todo-list-basic.yaml).
An explanation of the generator output can be found [here](#openapi_generator_output).

### Embedded multi-valued relationships

In the [To-do List example](#to_do_list) above, the "collection" that holds the URLs of the multi-valued relationship is a separate resource with its own URL and representation.
It is also possible to express a multi-valued relationship by embedding a collection of URLs directly in the entity that describes the relationship.
Rapier does not have a special syntax for expressing this pattern because it can be expressed using the standard capabilities of 
JSON Schema along with Rapier's single-valued relationships. Suppose, for example, that the JSON for a TodoList looked like this:

```JSON
{"todos": [
    "http://example.org/xxxxx-1",
    "http://example.org/xxxxx-2"
  ]
}
```
The Rapier description would look like this:
```YAML
entities:
  TodoList:
    properties:
      todos:
        type: array
        items:
          type: string
          format: uri
          relationship: '#Item'
```

### <a name="query_paths"></a>Query Paths
 
So far we have seen examples of APIs that are easy to navigate by following links. Rapier also supports `Query URLs` in an API. `Query URLs` allow the client to
locate a particular resource directly without navigating the web of resources from the root to find it.
In contrast to links, which are intended to be opaque to clients, query URLs have formats that clients are expected to understand in order to compose them. Links are
expected to be stable over time—you should be able to safely bookmark them or store them in a database, and when you recover them and reuse them, they should identify the same permanent entity. 
By contrast, query URLs, as the name implies, may return variable results over time, or may fail altogether in the future, as data changes. For this reason, in most cases, it will be inappropriate to bookmark query URLs or to
store them in databases.
`Query URLs` are defined in Rapier using `Query Paths`.
A `Query Path` describes a path along the relationships between resources for quickly locating resources without having to retrieve all the resources along the path. 
Each segment of a `query path` corresponds to a relationship declared in the entity that is at that position in the path.
Each `Query Path` implies a URI or [URI Template](https://tools.ietf.org/html/rfc6570) that is part of the API.
The following example should make this clearer.

```yaml
title: Todo List API
conventions:
  queryPathSelectorLocation: pathSegment
entities:
  TodoList:
    wellKnownURLs: /
    queryPaths: [todos, "todos;{id}"]
    readOnly: true
    properties:
      todos:
        type: string
        format: uri
        relationship:
          collectionResource: '#Collection'
          entities: '#Item'
          multiplicity: 0:n
  Item:
    properties:
      id:
        type: string
        readOnly: true
      description:
        type: string
      due:
        type: string
        format: date-time
  Collection:
    readOnly: true
    properties:
      contents:
        type: array
        items: 
          $ref: '#/entities/Item'
```                

The combination of the `wellKnownURLs` and `queryPaths` properties of `ToDoList` implies that the following `Query URL` and URI template are valid:

    /todos
    /todos/{id}

The provision of
links in the resources themselves reduces the need for query URLs compared with an API that lacks links, but there are still situations where query URLs are important.
The meaning of the first URL is "the resource that is referenced by the `todos` property of the resource at `/`". In other words, we are starting at `/`
and following the `todos` relationship declared in the data model, but without having to retrieve the resource at `/`. 
The second URI template indicates that we can form a query URL by appending the value of the `id` property of an `Item` on to the end 
of the URL `/todos` to form a URL that will identify a single `Item` amongst the collection of items at `/todos`. 

`/todos` and `/todos/{id}` are valid because there is a TodoList at `/`, but the template is valid for any TodoList URL, like this:

    {TodoList-URL}/todos
    {TodoList-URL}/todos/{id}
    
In the [To-do List example](#to_do_list) above, the value of the `todos` property of the TodoList at `/` was shown as `http://example.org/xxxxx`. From this we know that `http://example.org/xxxxx` and 
`http://example.org/todos` must be aliases of each other, and a particular implementation may choose to make them the same (or not).

If you want to see the generated OpenAPI document for this API specification, [it is here](https://github.com/apigee-labs/rapier/blob/master/util/test/gen_openapispec/todo-list-with-id.yaml).
An explanation of the generator output can be found [here](#openapi_generator_output).

### <a name="t_query_parameter"></a>Query Parameters

Specifying Query URLs using `query paths` provides an important way for clients to traverse a web of resources efficiently. Other important classes of queries
are 'projection queries' (queries that subset the properties of an entity), 'selection queries' (queries that subset the entitites) and queries that control order or grouping of information. These queries are specified with the `Query Parameter` feature of Rapier. 
Here is an example:
```yaml
entities:
  PetCollection:
    properties:
      items:
        type: array
        items: 
          $ref: '#/entities/Pet'
    queryParameters:
      tags:
        items:
          type: string
        type: array
        collectionFormat: multi
        required: false
      status:
        type: integer
        required: false
    readOnly: true
```
This definition is an extract from [the Pet Store example](https://github.com/apigee-labs/rapier/blob/master/util/test/petstore.yaml). 
The generated OpenAPI specification [is here](https://github.com/apigee-labs/rapier/blob/master/util/test/gen_openapispec/petstore.yaml). 
These query parameters imply that, for each PetCollection whose url is `pet-collection-1`, there is an unbounded set of related resources 
whose URL is of the form `pet-collection-1?tags=tag-1,..,tag-n&status=status-1`.
In the language of [RFC 6570](https://tools.ietf.org/html/rfc6570#section-2.4), the API includes a URI template of the form `{pet-collection-url}{?tags*,status}`.

Each of these resources is a "view" onto the larger `pet-collection-1` resource.
There is a different Rapier capability—[URI Templates](#templates)—that allows you to define a family of sibling resources, rather than subset resources.  

Query Parameters can also be added to a relationship, rather than the resource the relationship references. In this case the query parameter is valid for that relationship URL, but not for other
URLs that reference the same Entity.

We have seen three common patterns for query parameters on entities and multi-valued relationships:
- parameters that are specific to querying a collection. Examples are `limit`, `orderBy`, `direction` (ascending | descending). These are essentially properties of the collection itself. 
- a "projection" parameter that limits the fields being returned. In that case, the query parameter itself is not declared elsewhere, but its valid values would be declared properties of the entity. This pattern is used on regular entities as well as collections. 
- "selection" parameters that limit the contents of a collection to entities that match a particular property value. In this case the parameter is really a property of the the entity (or entities) that define(s) the elements of the collection

### <a name="templates"></a>URI Templates

URI Templates are used to define a family of resources of the same entity type whose URLs are similar except for some variable elements of the URL. 
The client must learn the URI Template and use it to "manufacture" a URL by sustituting variable values.
URI Templates are often used when the number of resources is unbounded, so that it is impossible or impractical to provide links for them all.
Suppose for example that I have an API that provides a Fahrenheit resource for every Celsius value. For the Celsius value `19.7234`, the URL of the 
corresponding Fahrenheit resource might be `http://example.org/Fahrenheit/19.7234` or `http://example.org/Fahrenheit?Celsius=19.7234`, according to your API style preference. 
This is this is not an application of the [Query Parameters](#t_query_parameter) feature above, because there is no larger resource at 
`http://example.org/Fahrenheit` that is being queried. 
This is not an application of [Query Paths](#query_paths) feature because `Celsius` is not a declared property or relationship of any entity.
The URI template language supported is documented in [RFC 6570](https://tools.ietf.org/html/rfc6570#section-2.4). 
The following YAML shows how to express the Fahrenheit example.

```yaml
entities:
  FahrenheitTemperature:
    type: number
    uriTemplates:
    - template: /Fahrenheit{?Celsius} # or /Fahrenheit/{Celsius} if you prefer that URI pattern
      variables:
        Celsius:
          type: number
``` 
or, more simply, if you don't care about specifying the type of the variable:
```yaml
entities:
  FahrenheitTemperature:
    type: number
    uriTemplates: /Fahrenheit{?Celsius} # or /Fahrenheit/{Celsius} if you prefer that URI pattern
``` 


### Dog Tracker
 
Another popular API example is the 'Dog Tracker' example. The Rapier spec for it [is here](https://github.com/apigee-labs/rapier/blob/master/util/test/dog-tracker.yaml). 
It shows a more complete example using the techniques we have already seen.
The generated OpenAPI document for this API specification [is here](https://github.com/apigee-labs/rapier/blob/master/util/test/gen_openapispec/dog-tracker.yaml)

### Property Tracker
 
The next example illustrates the use of more than one entity type in a single relationship. In this example, a Dog can be owned by a Person or an Institution and People and Institutions can own Bicycles as well as Dogs.
The [source for this example is here](https://github.com/apigee-labs/rapier/blob/master/util/test/property-tracker.yaml). 
This example strains the expressive power of OpenAPI - you can see a generated [OpenAPI document here](https://github.com/apigee-labs/rapier/blob/master/util/test/gen_openapispec/property-tracker.yaml).

### Spec Repo

Not every resource has structured content that can be expressed as JSON. Even for resources whose content can be expressed as JSON, there is sometimes a requirement to preserve the exact document format, character-by-character.
Resources with this characteristic must be updated with PUT instead of PATCH, and their properties must be stored outside of the resource content. [This sample](https://github.com/apigee-labs/rapier/blob/master/util/test/spec-hub.yaml) 
shows an example of how this case can be handled in Rapier. Here is the [corresponding generated OpenAPI document](https://github.com/apigee-labs/rapier/blob/master/util/test/gen_openapispec/spec-hub.yaml).
The SpecHub API includes some 'internal' URI templates that are used in the implementation but are not part of the API. The Rapier OpenAPI generator supports a -i command-line option that allows the implementation
view of the API to be generated instead of the client view. It can be found [here](https://github.com/apigee-labs/rapier/blob/master/util/test/gen_openapispec/spec-hub-with-impl.yaml).

## <a name="navigating"></a>Navigating the Repository

- js - a directory containing a Node package that is used by the generated Javascript SDKs
- py - a directory containing a Python module that is used by the generated Python SDKs
- test-servers - a directory contains some simple servers used to test the generated SDKs
- util - directory containing the SDK generators, the OpenAPI and HTML generators and the validator. This directory is a Python module
  - gen_openapispec.py - the OpenAPI generator
  - gen_html.py - the HTML generator
  - validate_rapier.py - the rapier validator
  - gen_js_sdk.py - the Javascript SDK generator
  - gen_py_sdk.py - the Python SDK generator
  - requirements.txt - the pip file with the python dependencies for these generators
  - test - a directory containing tests for the generators. This directory contains numerous samples.
    - gen_openapispec - a directory containing openapispec files generated from the samples
    - gen_html - a directory containing HTML files generated from the samples
    - gen_js_sdk - a directory containing Javascript sdk files generated from the samples
    - gen_js_sdk - a directory containing Python sdk files generated from the samples

## <a name="specification"></a>The Rapier Language Specification

### Schema

A Rapier Spec is a YAML `map`—conceptually like a JSON object. Its format is described in the next heading entitled [Rapier](#rapier).
It may contain references to other Rapier specifications or to JSON Schema documents that are not Rapier specifications. 

All properties are optional unless otherwise specified.

#### <a name="rapier"></a>Rapier

Field Name | Type | Description
---|:---:|---
id | `string` | The URI of the API. Note this is the URI of the API itself, not the Rapier document that describes it, nor the run-time URL at which an implementation of the API can be found. Can be any URI, although the use of URL fragments is popular for obvious reasons. The most common value is '#' - maybe we should make this the default.
title | `string` | The title of the API. Dublin Core title. The default is 'untitled'
version | `string` | The version of the API. The default is 'initial'
entities | [Entities](#entities) | The entities of the API.
consumes | `sequence` of [Media Type](media_type) | The media-types that may be used by clients when providing data in POST and PUT requests. The valid values for the Content-Type HTTP header in those requests. May also be specified as a single string, which is interpreted as a space-delimited list. This value can be overridden at a relationship level
produces | `sequence` of [Media Type](media_type) | The media-types that clients can request from the server in GET, POST, PUT, PATCH and DELETE requests. The valid values for the Accept HTTP header in those requests. May also be specified as a single string, which is interpreted as a space-delimited list. This value can be overridden at a relationship level
conventions | [Conventions](#conventions) | Conventions that affect the details of the HTTP messages of the API
securityDefinitions | [Security Definitions Object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#securityDefinitionsObject) | From the OpenAPI specification
security | [Security Requirement Object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#securityRequirementObject) | From the OpenAPI specification
implementationPrivateInformation | [Entities Private Extensions](#entities_private_extensions)

#### <a name="conventions"></a>Conventions

Field Name | Type | Description
---|:---:|---
queryPathSelectorLocation | `string` | Either the string "pathSegment" or "pathParameter". The default is "pathParameter". This controls whether the selector for a multi-valued relationship appears in a separate path segment of the URL, or as a path parameter in the same path segment as the relationship name.
patchConsumes | `string` | The media type used for PATCH requests. Default is `['application/merge-patch+json']`
errorResponse | `schema` | the schema of the response for all error cases. the default is `{}`
useEtag | `boolean` | Whether or not the ETag and If-Match headers are used to detect update collisions. Default is True

#### <a name="entities"></a>Entities

Its map of entities is the primary component of a Rapier API definition.

Field Pattern | Type | Description
---|:---:|---
{entity name} | [Entity](#entity) | The name of an entity. Provides the default value of the id of the entity. That is, if the entity does not have an explicit id value, it can be addressed using the URI fragment `#{entity name}`. For more infomation on this, see the [Rapier data model decription](https://github.com/apigee-labs/rapier/blob/master/data_model.md)

#### <a name="entity"></a>Entity

Each entity is a [JSON Schema](http://json-schema.org/). It includes the standard JSON Schema properties (e.g. `properties`) as well as some Rapier-specific ones.

Field Name | Type | Description
---|:---:|---
id | `string` | The URI of the entity. Can be any URI, although the use of URL fragments is popular for obvious reasons. The default value is a URL fragment composed from the entity name which is the YAML key of the entity. If the Entity has an explicit id value, it can be addressed using that URI. If it does not have an explicit id value, it can be addressed using the URI fragment `#{entity name}`. For more infomation on this, see the [Rapier data model decription](https://github.com/apigee-labs/rapier/blob/master/data_model.md)
queryPaths | `string` or `sequence of [Query Path](#query_path)` | If the value is a string, it is interpreted as a space-deliminated list of `query paths`.
wellKnownURLs | `string` or `sequence of URLs` | Well-known URLs at which a resource of this entity type can be found. If the value is a string, it is interpreted as a space-deliminated list of URLs. If the value is an sequence, each item is interpreted as a single URL. URLs must be path-absolute - i.e. they must begin with a single '/'. A well_known_URL is the URL of a single entity. If you are want to define a set of entities with a common URL pattern, see `URI Templates`
properties | [Properties](#properties) | The properties of the entity. This is the standard JSON Schema `properties` property, with some Rapier extensions.
readOnly | `boolean` | Indicates that resources of this Entity type can be read (GET, HEAD and OPTIONS methods are supported), but not written (PATCH, PUT and DELETE are not allowed). Exceptionally, this property name is in camelCase rather than snake_case to align with the JSON Schema property of the same name.
consumes | `string` or `sequence of string` | Overrides the global value fo consumes for this entity. Specifies the media types clients may provide to create or update the entity with POST, PUT (for string entities). If the value is a string, it must be a space-delimited list of media types
produces | `string` or `sequence of string` | Overrides the global value fo produces for this entity. Specifies the media types clients may request to GET the entity. If the value is a string, it must be a space-delimited list of media types
queryParameters | [Query Parameters](#query_parameters) | Query parameters are used to form the URLs of a set of smaller "view entities" that subset a larger entity. If there is an entity at the URL http://example/org/resource1, and it has query parameters a and b, then http://example/org/resource1?a=value1&b=value2 are resources that provide a subset of the data of http://example/org/resource1. If your need is instead to define a family of resources of the same type whose URLs are similar except for the query string portion, use `URI templates` instead
uriTemplates | `string` or `sequence of string` or [URI Template](#uri_template) or array of `URI Template`s| See [URI Templates](#templates) for an explanation of the meaning.
usage | `string` or `sequence of string` | [Usage](#usage)s

#### <a name="properties"></a>Properties

Field Pattern | Type | Description
---|:---:|---
{property name} | [Property](#property) | A property name.

#### <a name="property"></a>Property

Each property is a JSON Schema. It includes the standard JSON Schema properties (e.g. `type`, `format`, `readOnly`) as well as the following Rapier-specific ones. `readOnly` is interpreted to mean that the property may appear in a GET, but may not be set by the client in a POST, PUT or PATCH.

TODO: Support the common case of a 'write-once' property that can be set on POST, but not modified on PUT or PATCH. 

Field Name | Type | Description
---|:---:|---
relationship | [Relationship](#relationship) | States that the property is a relationship property. If this property is present, the type of the property must be `string` with a `format` of `uri`. 
usage | `string` or `sequence of string` | [Usage](#usage)s
 
#### <a name="usage"></a>Usage

Specifies with which methods an entity or property may be used. The value may be a YAML sequence of strings, or a space-delimited list in a single string.
Values are case-insensitive. Valid values are: 
- 'c' | 'create' - Can be use by the client with POST to create a new entity
- 'r' | 'read' | 'retrieve' | 'g' | 'get' - May be provided by the server on GET
- 'u' | 'update' | 'put' | 'patch' - Can be use by the client with PUT or PATCH to update an entity
- 'd' | 'delete' - Can be use by the client with DELETE to delete an entity

Examples are:
```yaml
---
usage: c r u d
---
usage:
-POST
-r
-DeLeTe
```

The default is 
```yaml
'c r u d'
```
i.e. all methods allowed. The following two examples are equivalent:
```yaml
---
readOnly: true
---
usage: read
```
`Create` is allowed for properties, but not entities. For an entity, whether or not it can be used in a POST for create is determined by the relationships that reference it, rather than the value of usage.

#### <a name="relationship"></a>Relationship

Describes a relationship to one or more other entities

Field Name | Type | Description
---|:---:|---
entities | `string` or `sequence of URLs` | A set of URLs of the entities this relationship may reference. If the value is a string, it is interpreted as a space-deliminated list of URLs. If the value is an sequence, each item is interpreted as a single URL.
multiplicity | `string` | The multiplicity of the relationship. The value is of the form x:y or just y. If the value of y is `n`, or a number greater than 1, then the relationship is multi-valued. If x is missing, it is presumed to be 0.
collectionResource | `url` | May only be set if the relationship is multi-valued. Its value is the URL of a JSON Schema for the 'collection-like' resource that represents the multi-valued relationship. The 'collection-like' resource should include, at a minimum, the URLs of the entities in the relationship.
readOnly | "true" or "false" | For multi-valued relationships, says whether a POST is valid. default is `false`
consumes | `string` or [Relationship Consumes](#relationship_consumes) | Specifies the media types and entities that can be POSTed to a multi-valued relationship. If the value is a string, it is a single media-type or a space-delimited list of media types
queryParameters | [Query Parameters](#query_parameters) | Query parameters are used to form the URLs of a set of smaller "view entities" that subset a multi-valued relationship collection. If there is a collection at the URL http://example/org/collection1, and it has query parameters a and b, then http://example/org/collection1?a=value1&b=value2 are collections that provide a subset of the data of http://example/org/collection1. If there are queryParameters specified for the collection entity itself, the set of valid queryParameters for the relationship is the the union of the two sets.

#### <a name="relationship_consumes"></a>Relationship Consumes

The most common pattern for a multi-valued relationship is that new entities are created by POSTing a representation of the entity type of the
relationship. In other words, the relationship property is the URL of a collection resource whose elements are of the
declared entity type of the relationship and you create a new element by POSTing an representation of the same type to the collection.
However, there are cases where the representation that is POSTed to create a new entity may be of a different type. In this case, Rapier allows you to specify both the media type and 
representation of these POSTed entities. See the [ssl.yaml](https://github.com/apigee-labs/rapier/blob/master/util/test/ssl.yaml) test sample for an example 

Field Pattern | Type | Description
---|:---:|---
{media-type} | `string` or `sequence` | One or more Entity URLs. If the value is a string, it is a space-delimited list of URLs 

#### <a name="query_path"></a>Query Path

A `query path` defines an URL in the API that represents a traversal of a declared relationship. For example, if an Entity called 
Child has a relationship property called 'mother',
then declaring the `query path` 'mother' for the Child entity says that
the URI template `{child-URL}/mother` is also part of the API where child-URL is the URL of any child. In other words, for a given value of child-URL, the
URL `{child-URL}/mother` is guaranteed to be a valid URL, and further, 
it is guaranteed to be an alias of the URL in the 'mother' property of the resource at `child-URL`.

A `query path` can be represented as a string. Here are some examples with their meaning:  
 
- `mother` - traverse the mother relationship. URI template is \{`child-URL`\}/mother  
- `siblings` - traverse the siblings relationship.  URI template is \{`child-URL`\}/siblings. Will return a collection  
- `siblings;{name}` - traverse the sibling relationship. Use the `name` property of the siblings to select a single sibling. URI template is \{`child-URL`\}/siblings;\{name\}  
- `siblings;name={name}` - same as the previous example except the URI template is \{`child-URL`\}/siblings;name=\{name\}  
- `siblings;name={name}/siblings` - traverse the siblings relationship, select a specific sibling, and then traverse their siblings.  URI template is \{`child-URL`\}/siblings;name=\{name\}/siblings}  

Multiple query paths may be included in the same string as a space-deliminated list.

#### <a name="query_parameters"></a>Query Parameters

A YAML map of query parameters

Field pattern | Type | Description
---|:---:|---
{paramter_id} | [Query Parameter](#query_parameter) | The names of the query parameters with their associated definitions 

#### <a name="query_parameter"></a>Query Parameter

A Query parameter that may be appended to the URL of an entity to identify an entity that is closely related to the entity identified by the URL.
A common use is to restrict the fields returned. 

Field Name | Type | Description
---|:---:|---
description | `string` | The description
required | `true or false` | The default is `false`
type | "string", "number", "integer", "boolean", or "array" | Required. The type of the parameter. Since the parameter is not located at the request body, it is limited to simple types (that is, not an object).
items | [Items Object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#itemsObject) | Required if the value of type is "array". From the OpenAPI spec
collectionFormat | `string` | From OpenAPI Spec. Determines the format of the array if type array is used. Possible values are: <ul><li>`csv` - comma separated values `foo,bar`. <li>`ssv` - space separated values `foo%20bar`. <li>`tsv` - tab separated values `foo\tbar`. <li>`pipes` - pipe separated values <code>foo&#124;bar</code>. </ul> Default value is `csv`.

#### <a name="media_type"></a>Media Type

Describes a media type. If a media type is given as a simple string, it applies to all entity types. If the media type is given as a JSON structure, you can say which entity types use it

Field pattern | Type | Description
---|:---:|---
{entity_id} | `sequence` of `string`s | the media types to be used with the associated entity. The list of media types may be given as an sequence or a space-deliminated list in a single string

#### <a name="entities_private_extensions"></a>Entities Private Extensions

The primary goal of Rapier is to describe an API as seen by a client. However, it is sometimes useful to capture additional implementation-private extensions for use by
proxies (like Apigee Edge) or implementation frameworks (like Apigee a127). This section expresses such information. 

Field Pattern | Type | Description
---|:---:|---
{entity name} | [Entity Private Extension](#entity_private_extension) | The name of an entity. Provides the default value of the id of the entity. That is, if the entity does not have an explicit id value, it can be addressed using the URI fragment `#{entity name}`. For more infomation on this, see the [Rapier data model decription](https://github.com/apigee-labs/rapier/blob/master/data_model.md)

#### <a name="entity_private_extension"></a>Entity Private Extension

Field Name | Type | Description
---|:---:|---
permalinkTemplate | [URI Template](#uri_template) | A specification of the format of permalinks for this entity. These are the client-opaque URLs that the server provides to identify an entity of this entity type. Documenting these templates is not important for clients, who are supposed to think of them as opaque, but can be important for implementation software and intermediate proxies.

#### <a name="uri_template"></a>URI Template

Field Name | Type | Description
---|:---:|---
template | `string` | A URI template that must contain a single variable.
variables | [Template Variables](#template_variables) | The type of the variable

#### <a name="template_variables"></a>Template Variables

Describes a variable. 

Field pattern | Type | Description
---|:---:|---
{variable_name} | Schema | the JSON Schema for the variable. Allows you to specify type, format and various JSON Schema constraints

## <a name="oas_generator">OpenAPI Generator

The Rapier OpenAPI generator is implemented by `gen_openapispec.py` in the util directory. It is written in python. It has a single external dependency—pyYAML. If you do not have pyYAML installed on your machine, you can install it using
`pip install pyYAML` or `easy_install pyYAML` or `pip install -r requirements.txt` using the requirements.txt in the util directory. Adding the util directory to your $PATH and your $PYTHONPATH will make it easier to use the generator.

`usage: gen_openapispec.py [-m, --yaml-merge] [-i, --include-impl] [-t, --suppress-templates] filename`

The generated OpenAPI specification is written to stdout. Errors and warnings are written to stderr. The normal usage pattern is to pipe this output to a file, like this: 

`gen_openapispec.py my-rapier-spec.yaml > my-openAPI-spec.yaml`

The `--yaml-merge` option makes more aggressive use of the yaml merge operator to make more compact (if sometimes less readable) output. 

The `--include-impl` option will generate, from the optional implementationPrivateInformation section,
extra information that is otherwise ommitted from the output.

The --suppress-templates option will generate paths but not templates. This simplifies the output a little for implementors who are only interested in the paths they need to implement. If you are generating for clients rather than implementors
we don't recommend using this option.

### <a name="openapi_generator_output"></a>Understanding the output of the Rapier OpenAPI generator

The OpenAPI generated by the Rapier utility is valid OpenAPI that captures all the meaning of the Rapier API to the degree that OpenAPI can express it.
In simple cases, OpenAPI can capture the full meaning, but OpenAPI has trouble with some cases, like heterogeneous relationships. The Rapier OpenAPI generator
orgnanizes the OpenAPI in a way that makes sense from a Rapier point of view—if you are familiar with OpenAPI, you may initially find that organization
confusing. Here are a few comments to guide you.

The Rapier generator creates an OpenAPI definition for each entity in the Rapier file. This definition matches the Rapier definition closely.
The Rapier generator adds a couple of custom properties (e.g. `x-interface`) to these definitions—these can be viewed as comments from an OpenAPI perspective.

The Rapier generator adds a whole section under the `x-interfaces` property at the same level as OpenAPI `definitions` and `paths`. Although
`x-interfaces` is a custom Rapier property, the contents of the section are valid OpenAPI [Path Item Objects](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#pathItemObject).
This is important, because they are included into OpenAPI path declarations further down. The Rapier generator groups the `Path Item Objects`
this way because multiple paths may lead to the same kind of resource or even the same resource, and we don't want to have to repeat the definitions multiple times.

The Rapier generator adds another whole section called `x-templates`. In a Rapier API, a path is always an example of a more general URI
template that has been partially resolved by substituting the well-known URL of an initial resource. For this reason, the Rapier generator
documents the general template first and then references it from the path. It does this using standard JSON-reference or YAML constructs.


## <a name="html_generator">HTML Generator

The Rapier HTML generator is implemented by `gen_html.py` in the util directory. It is written in python. It has a single external dependency—pyYAML. If you do not have pyYAML installed on your machine, you can install it using
`pip install pyYAML` or `easy_install pyYAML` or `pip install -r requirements.txt` using the requirements.txt in the util directory. Adding the util directory to your $PATH and your $PYTHONPATH will make it easier to use the generator.

`usage: gen_html.py filename`

The generated OpenAPI specification is written to stdout. Errors and warnings are written to stderr. The normal usage pattern is to pipe this output to a file, like this: 

`gen_html.py my-rapier-spec.yaml > my-rapier-spec.html`

Since rapier files can reference each other, the HTML files need to reference each other too. For these references, the HTML generator assumes that all the HTML
files are generated in a parallel file directory structure of files with the same name as the rapier spec but with an html file extension. This means that links between
HTML files will only work if they are all generated using the pattern `gen_html.py source-base-path/spec-file-name.yaml > target-base-path/spec-file-name.html` with the same value of `target-base-path` for each `spec-file-name`.

## <a name="validator">Validator

The Rapier validator is implemented by `validate_rapier.py` in the util directory. It is written in python. It has a single external dependency—pyYAML. If you do not have pyYAML installed on your machine, you can install it using
`pip install pyYAML` or `easy_install pyYAML` or `pip install -r requirements.txt` using the requirements.txt in the util directory. Adding the util directory to your $PATH and your $PYTHONPATH will make it easier to use the validator.

`usage: validate_rapier.py filename`

Errors and warnings are written to stderr.

## <a name="sdk_generators">SDK Generators

Rapier provides tools for generating SDK libraries for Javascript and Python from Rapier specifications. You can also generate SDKs by generating OpenAPI specifications from Rapier specs and
then generating SDKs from those. We wrote separate SDKs generators for Rapier because we believe that we can produce better SDKs for Rapier APIs from Rapier's higher-level constructs than can
be generated from the lower-level OpenAPI specification. The generators are in the utils directory and have the same prereqs as the validators. 

Usage of the generators is
```
gen_js_sdk.py rapier-file
gen_py_sdk.py rapier-file
``` 
The output is written to stdout, so a typical example would look like
```
gen_py_sdk.py my-rapier.yaml > my-sdk.py 
```

Both the generated python code and the generated Javascript code rely on a library, whose primary purpose is to provide a superclass/prototype for common behaviors.
For Python, the library is in the /py directory of the repository. For Javascript, it is in the /js directory.

The generated SDKs have not seen much testing or usage and are probably best considered 'proof of concept' at this point.

