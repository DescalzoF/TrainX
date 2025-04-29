package com.TrainX.TrainX.progress;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.MessageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService service;
    private final ProgressMapper mapper;

    public ProgressController(ProgressService service, ProgressMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping("/me")
    public ResponseEntity<ProgressDTO> getMyProgress() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserEntity current = (UserEntity) auth.getPrincipal();
        ProgressDTO dto = service.getProgressByUserId(current.getId());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateMyProgress(@RequestBody ProgressDTO dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UserEntity current = (UserEntity) auth.getPrincipal();
            ProgressDTO updated = service.updateProgress(current.getId(), dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error updating progress: " + e.getMessage()));
        }
    }
}
