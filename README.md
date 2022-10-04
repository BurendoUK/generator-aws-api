# Burendo AWS Scaffolder (BAS)

Goal: "Reduce Lead Time and Improve Quality of Value Enabling tasks in an Un-opinionated manner."

That's a lot of buzz-words, so what on earth does it mean?

You can explore the definitions in the [Terminology](#terminology) section below, but the fundamentals are 
that we are looking to automate certain tasks in order to eliminate the time we waste doing repetitive
tasks in inconsistent ways.  We aim to do this in a way that doesn't force developers onto rails and takes
decisions out of their hands.

## Terminology

| Term                   | Description                                                                                                                                    |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Value Add (VA)         | Activities that directly relate to the objectives of the customer. (e.g. Selling a product)                                                    |
| Non-Value Add (NVA)    | Activities that distract or inhibit Value-Add activities, such as Bugs, Meetings, Inconsistency, Repetition                                    |
| Value Enabling (VE)    | Activities that the customer would consider NVA , but must be completed regardless (e.g. Creating a Database table)                            |
| Reduce Lead Time (RLT) | Time saving activities that mean the task is completed quicker.                                                                                |
| Improve Quality (IQ)   | Activities that reduce the waste associated with failure and inconsistency.                                                                    |
| Product                | The BAS is used to generate a single customer product, and is composed of many deployments.                                                    |
| Deployment             | A single deployments may reflect the run-time executables (API, website, ETL) or Design-Time executables (e.g. CI/CD, terraform bootstrap)     |
| Module                 | A single feature within a deployment, such as an API, DynamoDB table, ECR, Lambda, etc.  A Module must be associated with a Deployment         |

```
Product --< Deployment --< Module
```

## Requirements

* [nodejs](https://nodejs.org/) (preferably using [nvm](https://github.com/nvm-sh/nvm))
* [npm](https://npmjs.org)
* [yeoman]([yeoman](https://yeoman.io/))

## Installation

1. Install Yeoman

   The Yeoman scaffolder is an open source project that allows us to
   create entire projects with minimum effort.

    ```
    npm install yo --global
    ```

1. Clone this repository

   At present we share the generator by cloning the repository.  In future
   this will be published to `npmjs.org` like other packages.

   ```
   git clone git@github.com:BurendoUK/generator-aws-api.git
   ```


1. Build and Link

   The Generator is written in TypeScript, and therefore needs to be built
   before it can be used.  Once built we then `npm link` it so that yeoman
   can make use of it.

   ```
   cd generator-aws-api.git
   npm install
   npm run build
   npm link
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
