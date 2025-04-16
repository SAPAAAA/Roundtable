import React, {useEffect, useRef} from 'react';

/**
 * A reusable Bootstrap modal component.
 *
 * @component
 *
 * @param {object} props
 * @param {string} props.id - The unique ID of the modal (used for toggling and accessibility).
 * @param {string} [props.mainClass] - Additional class(es) for the main modal container.
 * @param {string} [props.addClass] - Additional class(es) for the modal content.
 * @param {string} props.title - The title displayed in the modal header.
 * @param {React.ReactNode} props.children - The main content/body of the modal.
 * @param {React.ReactNode} [props.footer] - Custom footer content (can be buttons or any JSX).
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Function to call when the modal is requested to be closed.
 *
 * @returns {JSX.Element} A Bootstrap-styled modal dialog.
 *
 * @example
 * <Modal
 *   id="deleteConfirm"
 *   title="Confirm Deletion"
 *   isOpen={isModalOpen}
 *   onClose={handleClose}
 *   footer={
 *     <div className="d-flex justify-content-end gap-2">
 *       <Button onClick={handleCancel}>Cancel</Button>
 *       <Button onClick={handleConfirm} className="btn-danger">Delete</Button>
 *     </div>
 *   }
 * >
 *   Are you sure you want to delete this item?
 * </Modal>
 */
export default function Modal(props) {
    const {
        id,
        mainClass,
        addClass,
        title,
        children,
        footer,
        isOpen,
        onClose,
    } = props;

    const modalRef = useRef(null);

    useEffect(() => {
        const modalElement = modalRef.current;
        if (isOpen) {
            const bootstrapModal = new window.bootstrap.Modal(modalElement);
            bootstrapModal.show();
        } else {
            const bootstrapModal = window.bootstrap.Modal.getInstance(modalElement);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        }
    }, [isOpen]);

    return (
        <div
            className={`modal fade ${mainClass || ''}`}
            id={id}
            ref={modalRef}
            tabIndex="-1"
            aria-labelledby={`${id}Label`}
            aria-hidden="true"
        >
            <div className="modal-dialog">
                <div className={`modal-content ${addClass || ''}`}>
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
                            onClick={onClose}
                        ></button>
                    </div>

                    {/* Modal body */}
                    <div className="modal-body ">
                        {children}
                    </div>

                    {/* Modal footer */}
                    {footer && <div
                        className="w-100 modal-footer d-flex justify-content-center align-items-center">{footer}</div>}
                </div>
            </div>
        </div>
    );
}