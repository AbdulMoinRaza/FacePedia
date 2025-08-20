import { useEffect, useRef } from 'react';

export default function PDF(props) {
	const containerRef = useRef(null);

	useEffect(() => {
		const container = containerRef.current;
		let PSPDFKit, instance;

		(async function () {
			try {
				PSPDFKit = await import('pspdfkit');

				// Unload any previous instance
				PSPDFKit.unload(container);

				// Load PSPDFKit instance
				instance = await PSPDFKit.load({
					container,
					document: props.document,
					baseUrl: 'http://localhost:3000/pspdfkit-lib/', // Adjust base URL
				});
			} catch (error) {
				console.error("Error loading PSPDFKit:", error);
			}
		})();

		// Cleanup on component unmount
		return () => PSPDFKit && PSPDFKit.unload(container);
	}, []);

	return (
		<div
			ref={containerRef}
			style={{ width: '100%', height: '100vh' }}
		/>
	);
}
