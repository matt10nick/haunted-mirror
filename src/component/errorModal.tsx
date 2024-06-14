import React from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';

interface ErrorModalProps {
  errorMessage: string;
  open: boolean;
  onClick: any; 
}

const ErrorModal: React.FC<ErrorModalProps> = ({ errorMessage, open, onClick }) => {

  return (
    <div>
      
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Error
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px'  }}>
            <Button variant="contained" onClick={onClick}>OK</Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ErrorModal;