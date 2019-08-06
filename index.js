const moment =				require ('moment')
const soap =				require ('soap')
const { parseString: parse_string } =	require ('xml2js')
const endpoint =			'https://ws.colissimo.fr/sls-ws/SlsServiceWS?wsdl'

const Colissimo = function ({ contract_number, password }) {
	if (!contract_number || !password) {
		throw new Error ('You must define contract_number and password.')
	}

	this.contract_number = contract_number
	this.password = password
}

const get_product_code = ({ signature, is_return }) => {
	let code = 'DOM'
	if (is_return) {
		code = 'CORE'
	}
	else if (signature) {
		code = 'DOS'
	}
	return code
}

Colissimo.prototype.generate_label = function ({ sender = { }, receiver = { }, product = { }, format = { }, signature, is_return }) {
	return new Promise ((resolve, reject) => {
		const data = {
			generateLabelRequest: {
				attributes: {
					xmlns: ''
				},
				contractNumber: this.contract_number,
				password: this.password,
				outputFormat: {
					outputPrintingType: format.output_format || 'PDF_A4_300dpi'
				},
				letter: {
					service: {
						productCode: get_product_code ({ signature, is_return }),
						depositDate: /[0-9]{4}\-[0-9]{2}-[0-9]/.test (product.deposit_date) || moment ().add (1, 'day').format ('YYYY-MM-DD'),
						commercialName: format.commercial_name || undefined
					},
					parcel: {
						insuranceValue: `${product.insurance_value * 100}`,
						weight: product.weight || 1
					},
					sender: {
						address: {
							companyName: sender.company_name && `${product.identifier && `${product.identifier} `}${sender.company_name}` || undefined,
							lastName: sender.last_name || undefined,
							firstName: sender.first_name || undefined,
							line2: sender.address || undefined,
							line3: sender.to_know || undefined,
							countryCode: 'FR',
							city: sender.city || undefined,
							zipCode: sender.zip_code || undefined,
							phoneNumber: receiver.phone || undefined,
							mobileNumber: sender.phone_number || undefined,
							email: sender.mail || undefined,
							language: 'FR'
						}
					},
					addressee: {
						address: {
							companyName: receiver.company_name && `${product.identifier && `${product.identifier} `}${receiver.company_name}` || undefined,
							lastName: receiver.last_name || undefined,
							firstName: receiver.first_name || undefined,
							line2: receiver.address || undefined,
							line3: receiver.to_know || undefined,
							countryCode: 'FR',
							city: receiver.city || undefined,
							zipCode: receiver.zip_code || undefined,
							phoneNumber: receiver.phone || undefined,
							mobileNumber: receiver.phone_number || undefined,
							email: receiver.mail || undefined,
							language: 'FR'
						}
					}
				}
			}
		}

		return soap.createClient (endpoint, (error, client) => {
			if (error) { return reject (error) }

			client.addBodyAttribute ({ xmlns: 'http://sls.ws.coliposte.fr' })
			client.generateLabel (data, (error, result, body) => {
				if (error) { return reject (error) }

				return parse_string (body, (error, result) => {
					if (error) { return reject (error) }

					result = result['soap:Envelope']['soap:Body'][0]['ns2:generateLabelResponse'][0].return [0]
					if (!result.labelResponse) { return reject (result.messages[0].messageContent[0]) }
					return resolve ({
						tracking_number: result.labelResponse[0].parcelNumber[0],
						label: result.labelResponse[0].pdfUrl[0]
					})
				})
			})
		})
	})
}

Colissimo.prototype.label = function ({ sender, receiver, product, signature }) {
	return this.generate_label ({ sender, receiver, product, signature, is_return: false })
}

Colissimo.prototype.return = function ({ sender, receiver, product, signature }) {
	return this.generate_label ({ sender, receiver, product, signature, is_return: true })
}

module.exports = function (options) {
	return new Colissimo (options)
}
