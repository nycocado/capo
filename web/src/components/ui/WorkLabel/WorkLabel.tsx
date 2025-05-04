import {Card} from "react-bootstrap";
import * as React from "react";

export function WorkLabel({children}: { children: React.ReactNode }) {
    return (
        <Card bg="dark" text="primary"
              className="rounded-3 mb-0 flex-grow-1 justify-content-center align-items-center">
            {children}
        </Card>
    );
}
