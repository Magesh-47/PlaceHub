package com.placement.portal.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    public String extractUsername(String token) {
        if (token == null) {
            throw new IllegalArgumentException("Token cannot be null");
        }
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        if (token == null) {
            throw new IllegalArgumentException("Token cannot be null");
        }
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        if (token == null) {
            throw new IllegalArgumentException("Token cannot be null");
        }
        if (claimsResolver == null) {
            throw new IllegalArgumentException("Claims resolver cannot be null");
        }
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(String username, String role) {
        if (username == null) {
            throw new IllegalArgumentException("Username cannot be null");
        }
        if (role == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignKey(), Jwts.SIG.HS256)
                .compact();
    }

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Boolean isTokenExpired(String token) {
        if (token == null) {
            throw new IllegalArgumentException("Token cannot be null");
        }
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        if (token == null) {
            throw new IllegalArgumentException("Token cannot be null");
        }
        return extractClaim(token, Claims::getExpiration);
    }

    public Boolean validateToken(String token, String username) {
        if (token == null) {
            throw new IllegalArgumentException("Token cannot be null");
        }
        if (username == null) {
            throw new IllegalArgumentException("Username cannot be null");
        }
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}
