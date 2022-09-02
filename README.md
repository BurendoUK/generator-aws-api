# Burendo API Scaffolder

This is an OpenSource project that generates APIs using Terraform and AWS.

This project is still very much a Work In Progress.

## Requirements

* nodejs
* npm
* yeoman

## Installation

1. Install Yeoman
2. Clone this repository
3. NPM link this repository

```
npm install yo --global
git clone git@github.com:BurendoUK/generator-aws-api.git
cd generator-aws-api.git
npm install
npm run build
npm run link
```

## Running

```
yo aws-api:app
```

```
yo aws-api:<command>
```

### Commands

1. app

    Initialise the application.

    ```
    yo aws-api:app
    ```

1. APIs
   1. api

        Create a new API

        ```
        yo aws-api:api
        ```

   2. api-resource

        Add a Resource (pathpart) to an API

        ```
        yo aws-api:api-resource
        ```

   3. api-method

        Add a Lambda to handle a method (GET, POST, etc.) for a Resource

        ```
        yo aws-api:api-method
        ```

   4. api-swagger

        Generate an entire API from a swagger definition.

        ```
        yo aws-api:api-swagger
        ```

   5. api-dns

        Create a Custom domain for an API.  Requires a `dns` (below) entry has been completed.  This will also create the associated certificate.

        ```
        yo aws-api:api-dns
        ```

2. Storage
   1. dynamodb

        Create a dynamodb and associated read/write policies.  Reminder: tables should be encrypted at rest by default so ensure you've created a KMS key first.

        ```
        yo aws-api:dynamodb
        ```

   2.  s3

        Create an s3 bucket and associated read/write policies.  Reminder: buckets should be encrypted at rest by default so ensure you've created a KMS key first.

        ```
        yo aws-api:s3
        ```

   3.  kms

        Create a KMS key and associated read/write policies.

        ```
        yo aws-api:kms
        ```

3.  Networking
    1. dns

        Create a route53 hosted zone.

        ```
        yo aws-api:dns
        ```

    2.  vpc

        Create a simple VPC.

        ```
        yo aws-api:vpc
        ```

    3.  subnet

        Create a standard set of public/private subnets, along with internet gateway and/or net gateways.

        ```
        yo aws-api:subnet
        ```

4.  Event Bus



    1.  eventbus

        Create an AWS eventbus.

        ```
        yo aws-api:eventbus
        ```

    2.  eventbus-rule

        Create a rule and lambda for an AWS eventbus.

        ```
        yo aws-api:eventbus-rule
        ```
