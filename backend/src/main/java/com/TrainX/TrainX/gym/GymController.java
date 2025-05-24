package com.TrainX.TrainX.gym;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/gimnasios")
public class GymController {

    private final GymService gymService;

    @Autowired
    public GymController(GymService gymService) {
        this.gymService = gymService;
    }

    // Create new gym
    @PostMapping("/add")
    public ResponseEntity<GymDTO> createGym(@RequestBody GymDTO gymDTO) {
        GymDTO createdGym = gymService.createGym(gymDTO);
        return new ResponseEntity<>(createdGym, HttpStatus.CREATED);
    }

    // Get all gyms
    @GetMapping("/all")
    public ResponseEntity<List<GymDTO>> getAllGyms() {
        List<GymDTO> gyms = gymService.getAllGyms();
        return new ResponseEntity<>(gyms, HttpStatus.OK);
    }

    // Get gym by id
    @GetMapping("/{id}")
    public ResponseEntity<GymDTO> getGymById(@PathVariable Long id) {
        return gymService.getGymById(id)
                .map(gymDTO -> new ResponseEntity<>(gymDTO, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Update gym
    @PutMapping("/{id}")
    public ResponseEntity<GymDTO> updateGym(@PathVariable Long id, @RequestBody GymDTO gymDTO) {
        GymDTO updatedGym = gymService.updateGym(id, gymDTO);
        if (updatedGym != null) {
            return new ResponseEntity<>(updatedGym, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Delete gym
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteGym(@PathVariable Long id) {
        gymService.deleteGym(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
