import React from 'react';

export default function Modal({id, title, children, footerButtons = []}) {
    return (
        <div
            className="modal fade"
            id={id}
            tabIndex="-1"
            aria-labelledby={`${id}Label`}
            aria-hidden="true"
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    {/* Modal header */}
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id={`${id}Label`}>
                            {title}
                        </h1>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>

                    {/* Modal body */}
                    <div className="modal-body">
                        {children}
                    </div>

                    {/* Modal footer with dynamic buttons */}
                    <div className="modal-footer">
                        {footerButtons.map((btn) => (
                            btn
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
