interface NotificationProps {
	message: string | null
}

const Notification = ({ message }: NotificationProps) => {
	if (message === null) {
		return null
	}
	return (
	  <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded text-green-700 text-sm">
			{message}
		</div>
	)
}

export default Notification