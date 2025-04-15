package com.TrainX.TrainX.Profile;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {
    private final UserRepository userRepository;
    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserEntity updateUser(Long id, UserEntity userDetails) {
        UserEntity existingUser = getUserById(id);
        existingUser.setUsername(userDetails.getUsername());
        existingUser.setSurname(userDetails.getSurname());
        existingUser.setPassword(userDetails.getPassword());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setAge(userDetails.getAge());
        existingUser.setPhoneNumber(userDetails.getPhoneNumber());
        existingUser.setHeight(userDetails.getHeight());
        existingUser.setWeight(userDetails.getWeight());
        existingUser.setUserPhoto(userDetails.getUserPhoto());
        existingUser.setAddress(userDetails.getAddress());
        existingUser.setSex(userDetails.getSex());
        existingUser.setIsPublic(userDetails.getIsPublic());
        existingUser.setRole(userDetails.getRole());
        existingUser.setCoins(userDetails.getCoins());
        existingUser.setXpFitness(userDetails.getXpFitness());
        return userRepository.save(existingUser);
    }

    public UserEntity getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}
