# FilterParser lib

## Introduction

This lib has been generated with the parser generator [antlr](https://www.antlr.org/index.html) using the grammar defined in `FilterLanguage.g4`

## How to generate

Make sur you have java installed.

Download [antlr tool](https://www.antlr.org/download.html) (this version was generated using this version [https://www.antlr.org/download/antlr-4.13.1-complete.jar](https://www.antlr.org/download/antlr-4.13.1-complete.jar)).

Run `java -Xmx500M -cp "<path_to_antlr>/antlr-4.13.1-complete.jar:." org.antlr.v4.Tool -Dlanguage=TypeScript -visitor FilterLanguage.g4`
