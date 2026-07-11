# Shipment Tracking System

A full-stack app for tracking shipments end to end, booking, status updates, and customer notifications, with separate access levels for admins, employees, and customers.

## What it does

Create a shipment with sender and receiver details, package weight and dimensions, number of packages, and transport mode (air, road, or sea). Every shipment gets a unique tracking number, prefixed by mode, so you can tell at a glance how something's moving.

Status updates (Pending, Picked Up, In Transit, Out for Delivery, Delivered) build a timeline that customers can check without logging in.

There are three roles. Admins manage everything, including employees and customer records. Employees can create and update shipments but can't see customer data. Customers can sign up to track their own shipments in one place.

The first admin account gets created through a one-time setup form, not a hardcoded password sitting in the codebase. Receivers get an email with a direct tracking link the moment a shipment is booked. Buying and selling rates can be entered per shipment, with margin worked out automatically. Indian pincode lookup auto-fills state and city. Shipments, customers, and employees can all be exported to Excel, and shipment details can be edited after creation without disturbing the status history.

## Stack

React (Vite) on the frontend, Express and MongoDB on the backend, JWT for auth, Nodemailer for email, SheetJS for the Excel exports. Deployed on Vercel and Render, database on Atlas.

## Structure

- client/   React app: dashboards for admin and employee, plus the public tracking page
- server/
- models/       User and Shipment schemas
- controllers/  Route logic
- routes/       Endpoints, wired up with auth middleware
- middleware/   JWT checks and role guards
- utils/        Tracking number generation, email sending, token signing

## Security

No admin password is hardcoded anywhere. The setup endpoint that creates the first admin account locks itself permanently after one use, so it can't be run again even if someone finds the URL.

The public tracking page only shows city-level location and status, never full addresses or phone numbers. Passwords are hashed with bcrypt, and every protected route checks the JWT's role claim server-side, not just in the frontend.

## Status

Live and handling real shipments.