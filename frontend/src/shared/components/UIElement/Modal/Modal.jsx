import React from 'react';

/**
 * A reusable Bootstrap modal component.
 *
 * @component
 *
 * @param {object} props
 * @param {string} props.id - The unique ID of the modal (used for toggling and accessibility).
 * @param {string} props.title - The title displayed in the modal header.
 * @param {React.ReactNode} props.children - The main content/body of the modal.
 * @param {React.ReactNode[]} [props.footerButtons=[]] - An array of React elements (usually buttons) rendered in the modal footer.
 *
 * @returns {JSX.Element} A Bootstrap-styled modal dialog.
 *
 * @example
 * <Modal
 *   id="deleteConfirm"
 *   title="Confirm Deletion"
 *   footerButtons={[
 *      <Button key="cancel" contentType="text" onClick={handleCancel} dataBsDismiss="modal" outline={{ color: 'secondary' }}>
 *          <span className="fs-6">Cancel</span>
 *      </Button>,
 *      <Button key="confirm" contentType="text" onClick={handleConfirm} background={{ color: 'danger' }}>
 *          <span className="fs-6">Delete</span>
 *      </Button>,
 *   ]}
 * >
 *   Are you sure you want to delete this item?
 * </Modal>
 */
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
                        {footerButtons.map((btn) => btn)}
                    </div>
                </div>
            </div>
        </div>
    );
}
