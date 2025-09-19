import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

export class AnymailFinder implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Anymailfinder',
		name: 'anymailFinder',
		icon: 'file:anymailfinder.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Find and verify email addresses using Anymailfinder API',
		defaults: {
			name: 'Anymailfinder',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'anymailFinderApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.anymailfinder.com',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account Info',
						value: 'accountInfo',
						description: 'Get account details and credits',
					},
					{
						name: 'Company Email',
						value: 'companyEmails',
						description: 'Find all emails at a company',
					},
					{
						name: 'Decision Maker',
						value: 'decisionMaker',
						description: 'Find decision maker\'s email',
					},
					{
						name: 'Email Verification',
						value: 'emailVerification',
						description: 'Verify if an email is valid',
					},
					{
						name: 'LinkedIn Email',
						value: 'linkedinEmail',
						description: 'Find email by LinkedIn URL',
					},
					{
						name: 'Person Email',
						value: 'personEmail',
						description: 'Find a person\'s email address',
					},
				],
				default: 'personEmail',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['personEmail'],
					},
				},
				options: [
					{
						name: 'Find Email',
						value: 'findEmail',
						description: 'Find a person\'s email by name and company',
						action: 'Find a person\'s email',
						routing: {
							request: {
								method: 'POST',
								url: '/v5.1/find-email/person',
								body: {
									full_name: '={{$parameter["fullName"]}}',
									domain: '={{$parameter["domain"] || undefined}}',
									company_name: '={{$parameter["companyName"] || undefined}}',
								},
							},
						},
					},
				],
				default: 'findEmail',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['companyEmails'],
					},
				},
				options: [
					{
						name: 'Find Emails',
						value: 'findEmails',
						description: 'Find all emails at a company',
						action: 'Find company emails',
						routing: {
							request: {
								method: 'POST',
								url: '/v5.1/find-email/company',
								body: {
									domain: '={{$parameter["domain"] || undefined}}',
									company_name: '={{$parameter["companyName"] || undefined}}',
								},
							},
						},
					},
				],
				default: 'findEmails',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['decisionMaker'],
					},
				},
				options: [
					{
						name: 'Find Email',
						value: 'findEmail',
						description: 'Find decision maker\'s email',
						action: 'Find decision maker email',
						routing: {
							request: {
								method: 'POST',
								url: '/v5.1/find-email/decision-maker',
								body: {
									domain: '={{$parameter["domain"] || undefined}}',
									company_name: '={{$parameter["companyName"] || undefined}}',
								},
							},
						},
					},
				],
				default: 'findEmail',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['linkedinEmail'],
					},
				},
				options: [
					{
						name: 'Find Email',
						value: 'findEmail',
						description: 'Find email by LinkedIn profile URL',
						action: 'Find email by LinkedIn URL',
						routing: {
							request: {
								method: 'POST',
								url: '/v5.1/find-email/linkedin-url',
								body: {
									linkedin_url: '={{$parameter["linkedinUrl"]}}',
								},
							},
						},
					},
				],
				default: 'findEmail',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['emailVerification'],
					},
				},
				options: [
					{
						name: 'Verify Email',
						value: 'verifyEmail',
						description: 'Verify if an email address is valid',
						action: 'Verify email address',
						routing: {
							request: {
								method: 'POST',
								url: '/v5.1/verify-email',
								body: {
									email: '={{$parameter["email"]}}',
								},
							},
						},
					},
				],
				default: 'verifyEmail',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['accountInfo'],
					},
				},
				options: [
					{
						name: 'Get Info',
						value: 'getInfo',
						description: 'Get account details and remaining credits',
						action: 'Get account information',
						routing: {
							request: {
								method: 'GET',
								url: '/v5.0/meta/account.json',
							},
						},
					},
				],
				default: 'getInfo',
			},
			// Person Email Parameters
			{
				displayName: 'Full Name',
				name: 'fullName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['personEmail'],
						operation: ['findEmail'],
					},
				},
				default: '',
				description: 'The full name of the person (e.g., "John Doe")',
			},
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['personEmail', 'companyEmails', 'decisionMaker'],
						operation: ['findEmail', 'findEmails'],
					},
				},
				default: '',
				description: 'Company domain (e.g., "example.com"). Use either domain or company name.',
			},
			{
				displayName: 'Company Name',
				name: 'companyName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['personEmail', 'companyEmails', 'decisionMaker'],
						operation: ['findEmail', 'findEmails'],
					},
				},
				default: '',
				description: 'Company name (e.g., "Apple Inc"). Use either domain or company name.',
			},
			// LinkedIn Email Parameters
			{
				displayName: 'LinkedIn URL',
				name: 'linkedinUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['linkedinEmail'],
						operation: ['findEmail'],
					},
				},
				default: '',
				description: 'LinkedIn profile URL',
			},
			// Email Verification Parameters
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				required: true,
				displayOptions: {
					show: {
						resource: ['emailVerification'],
						operation: ['verifyEmail'],
					},
				},
				default: '',
				description: 'Email address to verify',
			},
			// Additional Fields
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['personEmail'],
						operation: ['findEmail'],
					},
				},
				options: [
					{
						displayName: 'First Name',
						name: 'firstName',
						type: 'string',
						default: '',
						description: 'Person\'s first name (alternative to full name)',
					},
					{
						displayName: 'Last Name',
						name: 'lastName',
						type: 'string',
						default: '',
						description: 'Person\'s last name (alternative to full name)',
					},
					{
						displayName: 'Position',
						name: 'position',
						type: 'string',
						default: '',
						description: 'Person\'s job title or position',
					},
					{
						displayName: 'Department',
						name: 'department',
						type: 'string',
						default: '',
						description: 'Department the person works in',
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['companyEmails', 'decisionMaker'],
						operation: ['findEmail', 'findEmails'],
					},
				},
				options: [
					{
						displayName: 'Department',
						name: 'department',
						type: 'string',
						default: '',
						description: 'Filter by department',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 50,
						description: 'Max number of results to return',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData;

				if (resource === 'personEmail' && operation === 'findEmail') {
					const fullName = this.getNodeParameter('fullName', i) as string;
					const domain = this.getNodeParameter('domain', i, '') as string;
					const companyName = this.getNodeParameter('companyName', i, '') as string;
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

					if (!domain && !companyName) {
						throw new NodeOperationError(this.getNode(), 'Either domain or company name must be provided', {
							itemIndex: i,
						});
					}

					const body: any = {};

					if (additionalFields.firstName && additionalFields.lastName) {
						body.first_name = additionalFields.firstName;
						body.last_name = additionalFields.lastName;
					} else {
						body.full_name = fullName;
					}

					if (domain) body.domain = domain;
					if (companyName) body.company_name = companyName;
					if (additionalFields.position) body.position = additionalFields.position;
					if (additionalFields.department) body.department = additionalFields.department;

					responseData = await this.helpers.requestWithAuthentication.call(
						this,
						'anymailFinderApi',
						{
							method: 'POST',
							url: 'https://api.anymailfinder.com/v5.1/find-email/person',
							body,
							json: true,
						},
					);
				} else if (resource === 'companyEmails' && operation === 'findEmails') {
					const domain = this.getNodeParameter('domain', i, '') as string;
					const companyName = this.getNodeParameter('companyName', i, '') as string;
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

					if (!domain && !companyName) {
						throw new NodeOperationError(this.getNode(), 'Either domain or company name must be provided', {
							itemIndex: i,
						});
					}

					const body: any = {};
					if (domain) body.domain = domain;
					if (companyName) body.company_name = companyName;
					if (additionalFields.department) body.department = additionalFields.department;
					if (additionalFields.limit) body.limit = additionalFields.limit;

					responseData = await this.helpers.requestWithAuthentication.call(
						this,
						'anymailFinderApi',
						{
							method: 'POST',
							url: 'https://api.anymailfinder.com/v5.1/find-email/company',
							body,
							json: true,
						},
					);
				} else if (resource === 'decisionMaker' && operation === 'findEmail') {
					const domain = this.getNodeParameter('domain', i, '') as string;
					const companyName = this.getNodeParameter('companyName', i, '') as string;
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

					if (!domain && !companyName) {
						throw new NodeOperationError(this.getNode(), 'Either domain or company name must be provided', {
							itemIndex: i,
						});
					}

					const body: any = {};
					if (domain) body.domain = domain;
					if (companyName) body.company_name = companyName;
					if (additionalFields.department) body.department = additionalFields.department;

					responseData = await this.helpers.requestWithAuthentication.call(
						this,
						'anymailFinderApi',
						{
							method: 'POST',
							url: 'https://api.anymailfinder.com/v5.1/find-email/decision-maker',
							body,
							json: true,
						},
					);
				} else if (resource === 'linkedinEmail' && operation === 'findEmail') {
					const linkedinUrl = this.getNodeParameter('linkedinUrl', i) as string;

					responseData = await this.helpers.requestWithAuthentication.call(
						this,
						'anymailFinderApi',
						{
							method: 'POST',
							url: 'https://api.anymailfinder.com/v5.1/find-email/linkedin-url',
							body: { linkedin_url: linkedinUrl },
							json: true,
						},
					);
				} else if (resource === 'emailVerification' && operation === 'verifyEmail') {
					const email = this.getNodeParameter('email', i) as string;

					responseData = await this.helpers.requestWithAuthentication.call(
						this,
						'anymailFinderApi',
						{
							method: 'POST',
							url: 'https://api.anymailfinder.com/v5.1/verify-email',
							body: { email },
							json: true,
						},
					);
				} else if (resource === 'accountInfo' && operation === 'getInfo') {
					responseData = await this.helpers.requestWithAuthentication.call(
						this,
						'anymailFinderApi',
						{
							method: 'GET',
							url: 'https://api.anymailfinder.com/v5.0/meta/account.json',
							json: true,
						},
					);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
