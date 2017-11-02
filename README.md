colissimo
==============

Generates label and return label with Colissimo SOAP API.

## Installation

`npm install colissimo`

## How it works

You can use `contractNumber/password` what you usually use to connect to https://www.colissimo.entreprise.laposte.fr/

## Example

```javascript
const colissimo  = require('colissimo') ({ contract_number: 'YOUR_CONTRACT_NUMBER', password: 'YOUR_PASSWORD' })

colissimo.label ({
	sender: {
		last_name: 'sender last name',
		first_name: 'sender first name',
		address: 'receiver address',
		to_know: 'to know',
		zip_code: '75000',
		city: 'Paris',
		phone_number: '0600000000',
		mail: 'mail@gmail.com'
	},
	receiver: {
		last_name: 'receiver last name',
		first_name: 'receiver first name',
		address: 'receiver address',
		to_know: 'to know',
		zip_code: '75000',
		city: 'Paris',
		phone_number: '0600000000',
		mail: 'mail@gmail.com'
	},
	product: {
		identifier: '1578',				// used to identify a package when you received it. its displayed before the company_name
		insurance_value: 100,			// the amount to insure
		weight: 1.2						// in kg, default 1
	},
	format: {
		commercial_name: 'commercial_name' // used for notifications
	}
}).then (infos => {
	console.log (infos)
}).catch (error => {
	console.error (error)
})
```
