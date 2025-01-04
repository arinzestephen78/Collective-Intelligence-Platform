;; Idea NFT Contract

(define-non-fungible-token idea-nft uint)

(define-data-var token-id-nonce uint u0)

(define-map token-uris uint (string-utf8 256))

(define-public (mint (recipient principal) (token-uri (string-utf8 256)))
  (let
    (
      (token-id (+ (var-get token-id-nonce) u1))
    )
    (try! (nft-mint? idea-nft token-id recipient))
    (map-set token-uris token-id token-uri)
    (var-set token-id-nonce token-id)
    (ok token-id)
  )
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (nft-transfer? idea-nft token-id sender recipient)
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? idea-nft token-id))
)

(define-read-only (get-token-uri (token-id uint))
  (ok (map-get? token-uris token-id))
)

(define-read-only (get-last-token-id)
  (ok (var-get token-id-nonce))
)

