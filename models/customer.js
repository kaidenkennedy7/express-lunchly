/** Customer for Lunchly */

const db = require('../db')
const Reservation = require('./reservation')

/** Customer of the restaurant */

class Customer {
    constructor({ id, firstName, lastName, phone, notes }) {
        this.id = id
        this.firstName = firstName
        this.lastName = lastName
        this.phone = phone
        this.notes = notes
    }

    /** find all customers */
    static async all() {
        const results = await db.query(
            `SELECT id,
            first_name AS "firstName",
            last_name AS "lastName",
            phone,
            notes
            FROM customers
            ORDER BY lasy_name, first_name`
        )
        return results.rows.map((c) => new Customer(c))
    }

    /** get customer by ID. */
    static async get(id) {
        const results = await db.query(
            `SELECT id,
            first_name AS "firstName",
            last_name AS "lastName",
            phone,
            notes
            FROM customers WHERE id = $1`,
            [id]
        )
        const customer = results.rows[0]
        if (customer === undefined){
            const err = new Error(`No such customer: ${id}`)
            err.status = 404
            throw err
        }
        return new Customer(customer)
    }

    /** get all reservations for this customer */
    async getReservations() {
        return await Reservation.getReservationsForCustomer(this.id)
    }

    /** save this customer */
    async save() {
        if (this.id === undefined) {
            const result = await db.query(
                `INSERT INTO customers (first_name, last_name, phone, notes)
                VALUES ($1, $2, $3, $4)
                RETURNING id`,
                [this.firstName, this.lastName, this.phone, this.notes]
            )
            this.id = results.rows[0].id
        } else {
            await db.query(
                `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
                WHERE id=$5`, 
                [this.firstName, this.lastName, this.phone, this.notes, this.id]
            )
        }
    }

    /** Save full name */
    fullName() {
        return `${this.firstName} ${this.lastName}`
    }
    
	// Search for a customer
	// async search(name) {
	// 	name = name.split(' ')
	// 	const result = await db.query(
	// 		`SELECT * FROM customers WHERE first_name '%' || $1 || '%' AND last_name LIKE '%' || $2 || '%2' OR CONCAT(first_name, ' ', last_name) LIKE '%' || $3 || '%'`,
	// 		[name[0], name[1], name[2]]
	// 	)
	// 	return result.rows.map((c) => {
	// 		c = new Customer()(c)
	// 		return c
	// 	})
	// }
}

module.exports = Customer