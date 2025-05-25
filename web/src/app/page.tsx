import {Container} from "react-bootstrap";

function AppPage() {
    return (
        <Container fluid className="d-flex vh-100 justify-content-center align-items-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to My App</h1>
                <p className="text-lg text-gray-700">This is a simple Next.js application.</p>
            </div>
        </Container>
    );
}

export default AppPage;

