"use client";
import { useState } from "react";

export default function LogisticsDashboard() {
	const [orderId, setOrderId] = useState("");
	const [status, setStatus] = useState("in transit");
	return (
		<div className="max-w-3xl mx-auto w-full p-5">
			<h1 className="text-2xl font-semibold mb-6">Logistics Dashboard</h1>
			<div className="space-y-3">
				<input className="border rounded px-3 py-2 w-full" placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
				<select className="border rounded px-3 py-2 w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
					<option value="processing">processing</option>
					<option value="in transit">in transit</option>
					<option value="delivered">delivered</option>
				</select>
				<button
					className="border rounded px-4 py-2"
					onClick={async () => {
						const res = await fetch("/api/shipments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, current_status: status }) });
						if (!res.ok) alert("Failed to update"); else alert("Updated");
					}}
				>
					Update Status
				</button>
			</div>
		</div>
	);
}

